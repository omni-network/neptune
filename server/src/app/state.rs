use crate::forks::{EthFork, ForkConfig, ForkError};

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
        let fork = EthFork::new(conf, name).await?;
        let mut forks = self.forks.write().await;
        let fork_id = &fork.id.clone();
        forks.insert(fork_id.clone(), fork);
        Ok(fork_id.clone())
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
