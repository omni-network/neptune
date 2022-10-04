use crate::forks::{BaseConfig, ChildConfig, EthFork, ForkConfig, ForkError};

use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;

// perhaps forks should be guarded with a rw lock as well
pub type ForksById = HashMap<String, EthFork>;
#[derive(Clone)]
pub struct NeptuneState {
    pub addr: SocketAddr,
    pub forks: Arc<RwLock<ForksById>>,
}

impl NeptuneState {
    pub fn new(addr: SocketAddr) -> Self {
        Self {
            addr,
            forks: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn create_fork(
        &self,
        cfg: Option<ForkConfig>,
        name: String,
    ) -> Result<String, ForkError> {
        let conf = cfg.unwrap_or_default();
        let fork = match conf {
            ForkConfig::Child(c) => self.create_child_fork(c, &name).await,
            ForkConfig::Base(b) => self.create_base_fork(b, &name).await,
        }?;

        //once we have successfully created a new fork, insert it into forks
        let mut forks = self.forks.write().await;
        let fork_id = &fork.id.clone();
        forks.insert(fork_id.clone(), fork);
        Ok(fork_id.clone())
    }

    async fn create_child_fork(
        &self,
        config: ChildConfig,
        name: &String,
    ) -> Result<EthFork, ForkError> {
        let mut config = config.clone();
        config.set_eth_rpc_url(self.addr.ip().to_string(), self.addr.port())?;
        {
            let forks = self.forks.read().await;
            if !forks.contains_key(&config.parent_fork_id) {
                return Err(ForkError::ForkNotFound(config.parent_fork_id.clone()));
            }
        }
        let mut forks = self.forks.write().await;
        if let Some(parent_fork) = forks.get_mut(&config.parent_fork_id) {
            let _ = parent_fork
                .set_base_block_number(config.clone().fork_block_number)
                .await?;
        }
        let conf = ForkConfig::Child(config.clone());
        EthFork::new(conf, name).await
    }

    async fn create_base_fork(
        &self,
        config: BaseConfig,
        name: &String,
    ) -> Result<EthFork, ForkError> {
        let conf = ForkConfig::Base(config.clone());
        EthFork::new(conf, name).await
    }

    pub async fn clear_forks(&self) {
        let mut forks = self.forks.write().await;
        forks.clear();
    }

    pub async fn delete_fork(&self, id: &str) -> Option<EthFork> {
        let mut forks = self.forks.write().await;
        forks.remove(id)
    }
}
