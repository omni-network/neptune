pub mod request;
pub mod response;
use super::state::NeptuneState;
use crate::{forks::ForkError, rpc::HttpNeptuneRpcHandler};
use anvil_rpc::request::Request;
use anvil_server::handler;
use axum::{
    extract::{rejection::JsonRejection, Extension, Path},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Json, Router,
};
use request::CreateForkRequest;
use response::{NeptuneError, OkResponse, WithForkIdResponse, WithForksResponse};

pub fn init(state: NeptuneState) -> Router {
    Router::new()
        .route("/forks", post(create_fork))
        .route("/forks", get(get_forks))
        .route("/forks/:id", post(handle_rpc))
        .route("/forks/:id", delete(delete_fork))
        .route("/reset", delete(clear_forks))
        .layer(Extension(state))
}

pub async fn clear_forks(Extension(state): Extension<NeptuneState>) -> Response {
    state.clear_forks().await;
    OkResponse { ok: true }.into_response()
}

pub async fn get_forks(Extension(state): Extension<NeptuneState>) -> Response {
    let forks = state.forks.read().await;
    WithForksResponse {
        forks: forks.clone(),
    }
    .into_response()
}

#[axum_macros::debug_handler]
pub async fn create_fork(
    body: Json<CreateForkRequest>,
    Extension(state): Extension<NeptuneState>,
) -> Result<Response, ForkError> {
    let fork_id = state
        .create_fork(body.config.clone(), body.name.clone())
        .await?;
    Ok(WithForkIdResponse { fork_id }.into_response())
}

#[axum_macros::debug_handler]
pub async fn delete_fork(
    Extension(state): Extension<NeptuneState>,
    Path(fork_id): Path<String>,
) -> Response {
    let mut forks = state.forks.write().await;

    if let Some(_) = forks.remove(&fork_id) {
        return OkResponse { ok: true }.into_response();
    }

    NeptuneError::ForkError(ForkError::ForkNotFound(fork_id)).into_response()
}

#[axum_macros::debug_handler]
pub async fn handle_rpc(
    Extension(state): Extension<NeptuneState>,
    Path(fork_id): Path<String>,
    request: Result<Json<Request>, JsonRejection>,
) -> Response {
    let forks = state.forks.read().await;

    if let Some(fork) = forks.get(&fork_id) {
        let handle = HttpNeptuneRpcHandler::new(fork.clone());
        let res = handler::handle(request, Extension(handle)).await;
        return res.into_response();
    }

    NeptuneError::ForkError(ForkError::ForkNotFound(fork_id)).into_response()
}
