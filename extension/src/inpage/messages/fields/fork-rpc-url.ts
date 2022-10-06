import { streamFor, sendMessage, waitForMessage } from 'inpage/messages/core'

export async function get() {
  sendMessage({ type: 'get-fork-rpc-url' })
  const { data } = await waitForMessage('get-fork-rpc-url__response')
  return data.forkRpcUrl
}

export function onChanged(cb: (forkRpcUrl?: string | null) => void) {
  streamFor('fork-rpc-url-changed').subscribe(msg => cb(msg.data.forkRpcUrl))
}
