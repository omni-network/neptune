import { ChainId } from 'shared/types'
import { Sender } from 'shared/messages'
import {
  waitForMessage,
  sendMessage,
  streamFor,
  justMessage,
  justSender,
} from 'background/messages/core'
import { sendTo, emit } from 'background/messages/utils'
import { parseErrorMessage } from 'shared/utils/error'

export function onGet(get: () => ChainId) {
  justSender(streamFor('get-chain-id')).subscribe(target =>
    sendTo(
      {
        type: 'get-chain-id__response',
        data: { chainId: get() },
      },
      target,
    ),
  )
}

export async function get() {
  sendMessage({ type: 'get-chain-id' })
  const { data } = await waitForMessage('get-chain-id__response')
  return data.chainId
}

export function onSet(set: (chaindId: ChainId) => void) {
  streamFor('set-chain-id').subscribe(([msg, sender]) => {
    const type = 'set-chain-id__response'

    try {
      set(msg.data.chainId),
      sendTo({ type, success: true, data: msg.data }, sender)
    } catch (e) {
      sendTo({ type, success: false, error: parseErrorMessage(e) }, sender)
    }
  })
}

export async function set(chainId: ChainId) {
  sendMessage({ type: 'set-chain-id', data: { chainId } })

  const res =  await waitForMessage('set-chain-id__response')
  if (!res.success) throw new Error(res.error)

  return res.data
}

export function onChanged(cb: (chainId: ChainId) => void) {
  justMessage(streamFor('chain-id-changed')).subscribe(msg =>
    cb(msg.data.chainId),
  )
}

export function emitChanged(chainId: ChainId) {
  emit({
    type: 'chain-id-changed',
    data: { chainId },
  })
}
