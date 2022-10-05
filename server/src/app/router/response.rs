use crate::forks::EthFork;
use axum::http::StatusCode;
use axum::{
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub enum NeptuneError {
    ForkNotFound,
}

impl IntoResponse for NeptuneError {
    fn into_response(self) -> Response {
        match self {
            Self::ForkNotFound => (StatusCode::NOT_FOUND, "Fork not found").into_response(),
        }
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

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct OkResponse {
    pub ok: bool,
}

impl IntoResponse for OkResponse {
    fn into_response(self) -> Response {
        (StatusCode::OK, Json(self)).into_response()
    }
}
