use crate::forks::{EthFork, ForkError};
use anvil_rpc::error::RpcError;
use axum::http::StatusCode;
use axum::{
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize)]
#[serde(deny_unknown_fields)]
pub enum NeptuneResult {
    #[serde(rename = "result")]
    Success(serde_json::Value),
    #[serde(rename = "error")]
    Error(NeptuneError),
}

impl IntoResponse for NeptuneResult {
    fn into_response(self) -> Response {
        match self {
            Self::Success(v) => Json(v).into_response(),
            Self::Error(e) => Json(e).into_response(),
        }
    }
}

impl From<NeptuneError> for NeptuneResult {
    fn from(e: NeptuneError) -> Self {
        Self::Error(e)
    }
}

impl From<EthFork> for NeptuneResult {
    fn from(fork: EthFork) -> Self {
        let fork = serde_json::to_value(fork);
        match fork {
            Ok(value) => NeptuneResult::Success(value),
            Err(e) => NeptuneResult::Error(NeptuneError::CustomError(e.to_string())),
        }
    }
}
impl From<OkResponse> for NeptuneResult {
    fn from(fork: OkResponse) -> Self {
        let fork = serde_json::to_value(fork);
        match fork {
            Ok(value) => NeptuneResult::Success(value),
            Err(e) => NeptuneResult::Error(NeptuneError::CustomError(e.to_string())),
        }
    }
}

impl From<WithForkIdResponse> for NeptuneResult {
    fn from(fork: WithForkIdResponse) -> Self {
        let fork = serde_json::to_value(fork);
        match fork {
            Ok(value) => NeptuneResult::Success(value),
            Err(e) => NeptuneResult::Error(NeptuneError::CustomError(e.to_string())),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub enum NeptuneError {
    #[serde(rename = "error")]
    ForkError(ForkError),
    RpcError(RpcError),
    CustomError(String),
}

impl From<ForkError> for NeptuneError {
    fn from(e: ForkError) -> Self {
        Self::ForkError(e)
    }
}

impl From<RpcError> for NeptuneError {
    fn from(e: RpcError) -> Self {
        Self::RpcError(e)
    }
}

#[derive(Serialize, Default)]
pub struct WithForksResponse {
    pub forks: HashMap<String, EthFork>,
}

impl IntoResponse for WithForksResponse {
    fn into_response(self) -> Response {
        (StatusCode::OK, Json(self)).into_response()
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Default)]
pub struct WithForkIdResponse {
    pub fork_id: String,
}

impl IntoResponse for WithForkIdResponse {
    fn into_response(self) -> Response {
        (StatusCode::OK, Json(self)).into_response()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OkResponse {
    pub ok: bool,
}

impl Default for OkResponse {
    fn default() -> Self {
        Self { ok: true }
    }
}

impl IntoResponse for OkResponse {
    fn into_response(self) -> Response {
        (StatusCode::OK, Json(self)).into_response()
    }
}
