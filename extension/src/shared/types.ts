import browser from 'webextension-polyfill'
import type { JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine'

export type HexString = `0x${string}`
export type ForkId = string
export type Account = HexString
export type ChainId = HexString

export type Fork = {
  id: ForkId
  name: string
}

export type RpcRequest<T = any> = JsonRpcRequest<T>
export type RpcResponse<T = any> = PendingJsonRpcResponse<T>
