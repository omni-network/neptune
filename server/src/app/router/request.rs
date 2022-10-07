use crate::forks::ForkConfig;
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct CreateForkRequest {
    pub config: Option<ForkConfig>,
    pub name: String,
}
