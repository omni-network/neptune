import { v4 as uuid } from 'uuid'
import { RpcRequest, RpcResponse } from 'shared/types'
import {
  waitForMessage,
  sendMessage,
  streamFor,
} from 'background/messages/core'
import { sendTo } from 'background/messages/utils'

export function onRequest(send: (data: RpcRequest) => Promise<RpcResponse>) {
  streamFor('rpc-request').subscribe(([msg, sender]) =>
    send(msg.data).then(res =>
      sendTo(
        {
          type: 'rpc-response',
          data: res,
          id: msg.id,
        },
        sender,
      ),
    ),
  )
}

export async function sendRequest(req: RpcRequest) {
  const id = uuid()

  sendMessage({
    type: 'rpc-request',
    data: req,
    id,
  })

  const { data: res } = await waitForMessage(
    'rpc-response',
    msg => msg.id === id,
  )

  return res
}
