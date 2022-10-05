//! Contains RPC handlers
use crate::forks::EthFork;
use anvil::eth::error::ToRpcResponseResult;
use anvil_core::eth::serde_helpers::*;
use anvil_core::eth::EthRequest;
use anvil_rpc::response::ResponseResult;
use anvil_server::RpcHandler;
use ethers::prelude::U256;
use serde::Deserialize;

#[derive(Clone)]
pub struct HttpNeptuneRpcHandler {
    // might be worth thread saving this too
    fork: EthFork,
}

impl HttpNeptuneRpcHandler {
    pub fn new(fork: EthFork) -> Self {
        Self { fork }
    }
}

/// Represents ethereum JSON-RPC API
#[derive(Clone, Debug, PartialEq, Deserialize)]
#[serde(tag = "method", content = "params")]
pub enum NeptuneRequest {
    #[serde(rename = "neptune_reset", with = "empty_params")]
    Reset(()),

    #[serde(rename = "neptune_stepBack", with = "sequence")]
    StepBack(U256),

    #[serde(rename = "neptune_stepBackOnce", with = "empty_params")]
    StepBackOnce(()),
}

#[derive(Clone, Debug, PartialEq, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(untagged)]
pub enum NeptuneOrEthRequest {
    EthRequest(EthRequest),
    NeptuneRequest(NeptuneRequest),
}

impl HttpNeptuneRpcHandler {
    async fn handle_eth_request(&self, request: EthRequest) -> ResponseResult {
        let api = self.fork.api.write().await;
        let response = api.execute(request.clone()).await;

        drop(api);

        match request {
            EthRequest::EthSendTransaction(_) | EthRequest::EthSendRawTransaction(_) => {
                self.fork.snapshot().await;
            }
            _ => {}
        }

        response
    }

    async fn handle_neptune_request(&self, request: NeptuneRequest) -> ResponseResult {
        match request {
            NeptuneRequest::Reset(_) => self.fork.reset().await.to_rpc_result(),
            NeptuneRequest::StepBack(n) => self.fork.step_back(n.as_usize()).await.to_rpc_result(),
            NeptuneRequest::StepBackOnce(_) => self.fork.step_back_once().await.to_rpc_result(),
        }
    }
}

#[async_trait::async_trait]
impl RpcHandler for HttpNeptuneRpcHandler {
    type Request = NeptuneOrEthRequest;

    async fn on_request(&self, request: Self::Request) -> ResponseResult {
        match request {
            Self::Request::EthRequest(req) => self.handle_eth_request(req).await,
            Self::Request::NeptuneRequest(req) => self.handle_neptune_request(req).await,
        }
    }
}
