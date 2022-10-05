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
use ethers::prelude::U256;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct Snapshot {
    pub id: U256,

    // TODO: unused for now, but could be used to rever to block num
    #[allow(dead_code)]
    pub block_number: u64,
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

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct ForkConfig {
    /// url of the rpc server that should be used for any rpc calls
    pub eth_rpc_url: String,
    /// pins the block number for the state fork
    pub fork_block_number: u64,
    /// whether or not to prefund anvil dev accounts
    pub prefund_anvil_accounts: bool,
}

impl EthFork {
    pub async fn new(cfg: Option<ForkConfig>, name: String) -> Self {
        let config = cfg.unwrap_or_default();
        let api = create_eth_api(config.clone()).await;
        let id = Uuid::new_v4().to_string();
        let base_block_number = api.block_number().unwrap().as_u64();

        let fork = Self {
            id,
            name,
            config,
            readonly: false,
            base_block_number,
            api: Arc::new(RwLock::new(api)),
            snapshots: Arc::new(RwLock::new(Vec::new())),
        };

        fork.snapshot().await;
        fork
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

        // TODO: fix unsafe unwrap
        let snapshot = snapshots.get(i).unwrap();

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

    pub async fn step_back_once(&self) -> Result<bool, BlockchainError> {
        self.step_back(1).await
    }

    pub async fn reset(&self) -> Result<bool, BlockchainError> {
        let times = self.snapshots.read().await.len();
        self.step_back(times).await
    }
}

pub async fn create_eth_api(cfg: ForkConfig) -> EthApi {
    let mut config = NodeConfig {
        eth_rpc_url: Some(cfg.eth_rpc_url),
        fork_block_number: Some(cfg.fork_block_number),
        ..Default::default()
    };

    if !cfg.prefund_anvil_accounts {
        config.genesis_accounts = Vec::new();
    }

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

    api
}
