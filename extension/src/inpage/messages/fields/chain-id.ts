import { ChainId } from 'shared/types'
import { streamFor, sendMessage, waitForMessage } from 'inpage/messages/core'

export function onChanged(cb: (chainId: ChainId) => void) {
  streamFor('chain-id-changed').subscribe(msg => cb(msg.data.chainId))
}

export async function get() {
  sendMessage({ type: 'get-chain-id' })
  const { data } = await waitForMessage('get-chain-id__response')
  return data.chainId
}

export async function set(chainId: ChainId) {
  sendMessage({ type: 'set-chain-id', data: { chainId } })
  await waitForMessage('chain-id-changed')
}
