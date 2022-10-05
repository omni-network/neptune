use anvil::{
    eth::{
        backend::info::StorageInfo,
        error::BlockchainError,
        fees::FeeHistoryService,
        miner::{Miner, MiningMode},
        pool::Pool,
        sign::{DevSigner, Signer as EthSigner},
        EthApi,
    },
    filter::Filters,
    logging::LoggingManager,
    service::NodeService,
    NodeConfig,
};
use axum::{http::StatusCode, response::IntoResponse};
use ethers::{prelude::U256, providers::ProviderError};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

#[derive(thiserror::Error, Debug)]
pub enum ForkError {
    #[error("cannot set base block number to {0}, current base is {1}")]
    BaseTooLow(u64, u64),
    #[error("cannot set base block number to {0}, current best block is {1}")]
    BaseTooHigh(u64, u64),
    #[error("cannot step back to {0}, base block number is {1}")]
    StepBackError(u64, u64),
    #[error("provided id is not a valid UUID: {0}")]
    InvalidForkId(String),
    #[error("fork with id ({0}) not found")]
    ForkNotFound(String),
    #[error("snapshot with id {0} not found")]
    SnapshotNotFound(usize),
}

pub enum ForkOrBlockchainError {
    Forkerror(ForkError),
    BlockchainError(BlockchainError),
}

fn into_response(err: impl Error) -> axum::response::Response {
    (StatusCode::BAD_REQUEST, err.to_string()).into_response()
}

impl IntoResponse for ForkError {
    fn into_response(self) -> axum::response::Response {
        into_response(self)
    }
}

#[derive(Clone, Debug)]
pub struct Snapshot {
    pub id: U256,

    // TODO: unused for now, but could be used to rever to block num
    #[allow(dead_code)]
    pub block_number: u64,
}

// splitting this up into two structs because we have distinct control flows for instantiating
// an independent fork and for instantiating a recursive fork.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
#[serde(deny_unknown_fields)]
pub enum ForkConfig {
    Child(ChildConfig),
    Base(BaseConfig),
}

impl ForkConfig {
    pub fn prefund_anvil_accounts(self) -> bool {
        match self {
            ForkConfig::Child(ChildConfig {
                prefund_anvil_accounts,
                ..
            }) => prefund_anvil_accounts,
            ForkConfig::Base(BaseConfig {
                prefund_anvil_accounts,
                ..
            }) => prefund_anvil_accounts,
        }
    }
}

impl Default for ForkConfig {
    fn default() -> Self {
        Self::Base(BaseConfig::default())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(deny_unknown_fields)]
pub struct ChildConfig {
    /// url of the rpc server that should be used for any rpc calls
    #[serde(skip)]
    eth_rpc_url: String,
    // optionally specify a parent fork
    pub parent_fork_id: String,
    /// pins the block number for the state fork
    pub fork_block_number: Option<u64>,
    /// whether or not to prefund anvil dev accounts
    pub prefund_anvil_accounts: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BaseConfig {
    /// url of the rpc server that should be used for any rpc calls
    pub eth_rpc_url: Option<String>,
    /// pins the block number for the state fork
    pub fork_block_number: Option<u64>,
    /// whether or not to prefund anvil dev accounts
    pub prefund_anvil_accounts: bool,
}

// we should have the default behavior to provide pre-funded accounts
// so beginning users have something to play with out of the box
impl Default for BaseConfig {
    fn default() -> Self {
        Self {
            eth_rpc_url: None,
            fork_block_number: None,
            prefund_anvil_accounts: true,
        }
    }
}
impl TryInto<NodeConfig> for ChildConfig {
    type Error = ForkError;

    fn try_into(self) -> Result<NodeConfig, Self::Error> {
        let fork_id = validate_fork_id(self.parent_fork_id.clone());
        match fork_id {
            Ok(_) => Ok(NodeConfig {
                ..Default::default()
            }),
            Err(_) => Err(Self::Error::InvalidForkId(self.parent_fork_id)),
        }
    }
}

impl ChildConfig {
    pub fn set_eth_rpc_url(&mut self, host: String, port: u16) -> Result<(), ForkError> {
        let valid = validate_fork_id(self.parent_fork_id.clone());
        match valid {
            Ok(_) => {
                self.eth_rpc_url = format!("{}:{}/forks/{}", host, port, self.parent_fork_id);
                Ok(())
            }
            Err(_) => Err(ForkError::InvalidForkId(self.parent_fork_id.clone())),
        }
    }
}

impl TryInto<NodeConfig> for BaseConfig {
    type Error = ForkError;

    fn try_into(self) -> Result<NodeConfig, Self::Error> {
        Ok(NodeConfig {
            eth_rpc_url: self.eth_rpc_url,
            fork_block_number: self.fork_block_number,
            ..Default::default()
        })
    }
}

impl TryInto<NodeConfig> for ForkConfig {
    type Error = ForkError;
    fn try_into(self) -> Result<NodeConfig, Self::Error> {
        let mut conf: NodeConfig = match self.clone() {
            ForkConfig::Child(cfg) => cfg.try_into(),
            ForkConfig::Base(cfg) => cfg.try_into(),
        }?;
        if !self.prefund_anvil_accounts() {
            conf.genesis_accounts = Vec::new();
        }
        Ok(conf)
    }
}

#[derive(Clone, Serialize)]
pub struct EthFork {
    pub id: String,
    pub name: String,
    pub config: ForkConfig,
    pub base_block_number: u64,
    pub readonly: bool,

    #[serde(skip)]
    pub api: Arc<RwLock<EthApi>>,

    #[serde(skip)]
    pub snapshots: Arc<RwLock<Vec<Snapshot>>>,
}

impl EthFork {
    pub async fn new(config: ForkConfig, name: &String) -> Result<Self, ForkError> {
        let api = create_eth_api(config.clone().try_into()?).await?;
        let id = Uuid::new_v4().to_string();
        let base_block_number = api.block_number().unwrap().as_u64();

        let fork = Self {
            id,
            name: name.clone(),
            config,
            readonly: false,
            base_block_number,
            api: Arc::new(RwLock::new(api)),
            snapshots: Arc::new(RwLock::new(Vec::new())),
        };

        fork.snapshot().await;
        Ok(fork)
    }

    pub async fn take_snapshot(&self) -> Snapshot {
        let api = self.api.read().await;
        let snapshot_id = api.evm_snapshot().await.unwrap();
        let block_number = api.block_number().unwrap().as_u64();

        let snapshot = Snapshot {
            id: snapshot_id,
            block_number,
        };

        snapshot
    }

    pub async fn save_snapshot(&self, snapshot: Snapshot) {
        let mut snapshots = self.snapshots.write().await;
        snapshots.push(snapshot);
    }

    pub async fn snapshot(&self) -> Snapshot {
        let snapshot = self.take_snapshot().await;
        self.save_snapshot(snapshot.clone()).await;
        snapshot
    }

    pub async fn step_back(&self, times: usize) -> Result<bool, BlockchainError> {
        let mut snapshots = self.snapshots.write().await;

        let i = if snapshots.len() > times {
            snapshots.len() - times
        } else {
            0
        };

        let snapshot = snapshots.get(i);
        match snapshot {
            Some(snapshot) => {
                let api = self.api.write().await;
                let result = api.evm_revert(snapshot.id).await;
                // TODO: do we need to prune api.backend.active_snapshots
                if i == 0 {
                    snapshots.truncate(1);
                } else {
                    snapshots.truncate(i);
                }
                result
            }
            None => Err(BlockchainError::ForkProvider(ProviderError::CustomError(
                format!("snapshot not found: {}", i),
            ))),
        }
    }

    pub async fn step_back_once(&self) -> Result<bool, BlockchainError> {
        self.step_back(1).await
    }

    pub async fn reset(&self) -> Result<bool, BlockchainError> {
        let times = self.snapshots.read().await.len();
        self.step_back(times).await
    }

    // sets the minimum block number a user can revert to
    pub async fn set_base_block_number(&mut self, num: Option<u64>) -> Result<(), ForkError> {
        let api_read = self.api.read().await;
        let best_num = api_read.backend.best_number().as_u64();
        let num = num.unwrap_or(best_num);
        if num > best_num {
            return Err(ForkError::BaseTooHigh(num, best_num));
        }

        if num < self.base_block_number {
            return Err(ForkError::BaseTooLow(num, self.base_block_number));
        }
        self.base_block_number = num;
        Ok(())
    }
}

pub async fn create_eth_api(mut config: NodeConfig) -> Result<EthApi, ForkError> {
    let logger: LoggingManager = Default::default();

    let backend = Arc::new(config.setup().await);

    let NodeConfig {
        signer_accounts,
        block_time,
        max_transactions,
        no_mining,
        transaction_order,
        genesis,
        ..
    } = config.clone();

    let pool = Arc::new(Pool::default());

    let mode = if let Some(block_time) = block_time {
        MiningMode::interval(block_time)
    } else if no_mining {
        MiningMode::None
    } else {
        // get a listener for ready transactions
        let listener = pool.add_ready_listener();
        MiningMode::instant(max_transactions, listener)
    };
    let miner = Miner::new(mode);

    let dev_signer: Box<dyn EthSigner> = Box::new(DevSigner::new(signer_accounts));
    let mut signers = vec![dev_signer];
    if let Some(genesis) = genesis {
        // include all signers from genesis.json if any
        let genesis_signers = genesis.private_keys();
        if !genesis_signers.is_empty() {
            let genesis_signers: Box<dyn EthSigner> = Box::new(DevSigner::new(genesis_signers));
            signers.push(genesis_signers);
        }
    }

    let fees = backend.fees().clone();
    let fee_history_cache = Arc::new(Mutex::new(Default::default()));
    let fee_history_service = FeeHistoryService::new(
        backend.new_block_notifications(),
        Arc::clone(&fee_history_cache),
        fees,
        StorageInfo::new(Arc::clone(&backend)),
    );

    let filters = Filters::default();

    // create the cloneable api wrapper
    let api = EthApi::new(
        Arc::clone(&pool),
        Arc::clone(&backend),
        Arc::new(signers),
        fee_history_cache,
        fee_history_service.fee_history_limit(),
        miner.clone(),
        logger,
        filters.clone(),
        transaction_order,
    );

    // required to be able to mine transactions
    let _ = tokio::task::spawn(NodeService::new(
        pool,
        backend,
        miner,
        fee_history_service,
        filters,
    ));

    Ok(api)
}

fn validate_fork_id(fork_id: String) -> Result<(), uuid::Error> {
    let id_underlying: &str = &fork_id.clone();
    match Uuid::parse_str(id_underlying) {
        Ok(_) => Ok(()),
        Err(e) => Err(e),
    }
}
