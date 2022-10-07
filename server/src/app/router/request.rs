use crate::forks::ForkConfig;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateForkRequest {
    pub config: Option<ForkConfig>,
    pub name: String,
}
