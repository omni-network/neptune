import { RpcRequest } from 'shared/types'
import { sendMessage, waitForMessage } from 'inpage/messages/core'
import { v4 as uuid } from 'uuid'

export async function sendRequest(data: RpcRequest) {
  const id = uuid()

  sendMessage({
    type: 'rpc-request',
    data,
    id,
  })

  // It's important to wait for not just any RPC_RESPONSE, but the
  // RPC_RESPONSE corresponding to the RPC_REQUEST we just sent. This mechanism
  // is not as important for other message types.
  const msg = await waitForMessage('rpc-response', msg => msg.id === id)
  return msg.data
}
