import browser from 'webextension-polyfill'
import {
  Account,
  ChainId,
  RpcRequest as RpcRequestData,
  RpcResponse as RpcResponseData,
  Fork,
} from 'shared/types'

/**
 * Standard GET / SET / CHANGED messgaes for some field, with some associated
 * data type.
 */
export type FieldMessage<F extends string, D> =
  | { type: `${F}-changed`; data: D }
  | { type: `get-${F}` }
  | { type: `get-${F}__response`; data: D }
  | { type: `set-${F}`; data: D }
  | { type: `set-${F}__response`; success: true; data: D }
  | { type: `set-${F}__response`; success: false; error: string }

/**
 * Connection differs from standard fields in that connection state is not
 * global connection state. Connections are managed per-tab.
 */

type GetConnection = {
  type: 'get-connection'
  // if none provided, we assume the sender
  data?: {
    tabId: number
  }
}

type GetConnectionResponse = {
  type: 'get-connection__response'
  data: {
    connected: boolean
    tabId: number
  }
}

type EmitConnectionChanged = {
  type: 'connection-changed'
  data: {
    connected: boolean
    tabId: number
  }
}

type SetConnection = {
  type: 'set-connection'
  data: {
    connected: boolean
    // if none provided, we assume the sender
    tabId?: number
  }
}

type SetConnectionResponse =
  | {
      type: 'set-connection__response'
      success: true
      data: {
        connected: boolean
        tabId: number
      }
    }
  | {
      type: 'set-connection__response'
      success: false
      error: string
      data: {
        // null if non provided on set
        tabId: number | null
      }
    }

type ConnectionMesage =
  | GetConnection
  | GetConnectionResponse
  | EmitConnectionChanged
  | SetConnection
  | SetConnectionResponse

/**
 * RPC requests messages are non standard, and require an ID so that we can
 * deterministicly match requests with corresposnding responses.
 */

type RpcRequest = {
  id: string
  type: 'rpc-request'
  data: RpcRequestData
}

type RpcResponse = {
  id: string
  type: 'rpc-response'
  data: RpcResponseData
}

type RpcMessage = RpcRequest | RpcResponse

export type Message =
  | FieldMessage<'accounts', { accounts: Account[] }>
  | FieldMessage<'chain-id', { chainId: ChainId }>
  | FieldMessage<'fork', { fork: Fork | null }>
  | FieldMessage<'fork-rpc-url', { forkRpcUrl: string | null }>
  | FieldMessage<'base-url', { baseUrl: string }>
  | FieldMessage<'provider-rpc-url', { providerRpcUrl: string | null }>
  | ConnectionMesage
  | RpcMessage

export type MessageType = Message['type']

export type MessageFor<T extends Message['type']> = Extract<
  Message,
  { type: T }
>

export type MessageData<T extends Message['type']> = MessageFor<T> extends {
  data?: infer D
}
  ? D
  : never

export type SetResponseMessageType = Extract<
  Message,
  { type: `set-${string}__response` }
>['type']

type D = MessageData<SetResponseMessageType>

export type WindowMessage = Message & {
  forwarded?: boolean
  extensionId: string
}

export type Sender = browser.runtime.MessageSender
