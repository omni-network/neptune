pub mod request;
pub mod response;
use super::state::NeptuneState;
use crate::{
    forks::{ForkConfig, ForkError},
    rpc::HttpNeptuneRpcHandler,
};
use anvil_rpc::request::Request;
use anvil_server::handler;
use axum::{
    extract::{rejection::JsonRejection, Extension, Path},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Json, Router,
};
use request::CreateForkRequest;
use response::NeptuneResult;
use response::{NeptuneError, OkResponse, WithForkIdResponse, WithForksResponse};

pub fn init(state: NeptuneState) -> Router {
    Router::new()
        .route("/forks", post(create_fork))
        .route("/forks", get(get_forks))
        .route("/forks/:id", post(handle_rpc))
        .route("/forks/:id", get(get_fork))
        .route("/forks/:id", delete(delete_fork))
        .route("/reset", delete(clear_forks))
        .layer(Extension(state))
}

pub async fn clear_forks(Extension(state): Extension<NeptuneState>) -> Response {
    state.clear_forks().await;
    OkResponse { ok: true }.into_response()
}

#[axum_macros::debug_handler]
pub async fn create_fork(
    body: Json<CreateForkRequest>,
    Extension(state): Extension<NeptuneState>,
) -> NeptuneResult {
    let fork_id = state
        .create_fork(body.config.clone(), body.name.clone())
        .await;
    match fork_id {
        Ok(fork_id) => NeptuneResult::from(WithForkIdResponse { fork_id }),
        Err(err) => NeptuneError::from(err).into(),
    }
}

#[axum_macros::debug_handler]
pub async fn delete_fork(
    Extension(state): Extension<NeptuneState>,
    Path(fork_id): Path<String>,
) -> Response {
    handle_delete_fork(&state, &fork_id).await.into_response()
}

async fn handle_delete_fork(state: &NeptuneState, fork_id: &String) -> NeptuneResult {
    let mut forks = state.forks.write().await;
    let fork = forks.get(&fork_id.clone());

    match fork {
        Some(f) => {
            if f.children.len() > 0 {
                NeptuneError::ForkError(ForkError::Readonly(format!("{:?}", f.children))).into()
            } else {
                //if this is a child fork, we want to remove the fork id from the parent
                match f.config.clone() {
                    ForkConfig::Child(cfg) => {
                        let parent = forks.get_mut(&cfg.parent_fork_id);
                        match parent {
                            Some(p) => {
                                let _ = p.remove_child(fork_id.clone());
                            }
                            None => {}
                        }
                    }
                    ForkConfig::Base(_) => {}
                }
                let _ = forks.remove(&fork_id.clone());
                NeptuneResult::from(OkResponse::default())
            }
        }
        None => NeptuneError::from(ForkError::ForkNotFound(fork_id.clone())).into(),
    }
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

    NeptuneResult::from(NeptuneError::ForkError(ForkError::ForkNotFound(fork_id))).into_response()
}

#[axum_macros::debug_handler]
pub async fn get_fork(
    Extension(state): Extension<NeptuneState>,
    Path(fork_id): Path<String>,
) -> NeptuneResult {
    let forks = state.forks.read().await;
    match forks.get(&fork_id) {
        Some(fork) => NeptuneResult::from(fork.clone()),
        None => NeptuneResult::from(NeptuneError::from(ForkError::ForkNotFound(fork_id))),
    }
}

pub async fn get_forks(Extension(state): Extension<NeptuneState>) -> Response {
    let forks = state.forks.read().await;
    WithForksResponse {
        forks: forks.clone(),
    }
    .into_response()
}
