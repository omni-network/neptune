use crate::forks::{EthFork, ForkConfig};
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

    pub async fn create_fork(&self, cfg: Option<ForkConfig>, name: String) -> EthFork {
        let fork = EthFork::new(cfg, name).await;
        let mut forks = self.forks.write().await;
        forks.insert(fork.id.clone(), fork.clone());
        fork
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
