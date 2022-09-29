use crate::forks::ForkConfig;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateForkRequest {
    pub config: Option<ForkConfig>,
    pub name: String,
}
