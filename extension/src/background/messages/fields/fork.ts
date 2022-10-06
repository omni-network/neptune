import { Fork } from 'shared/types'
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

export function onGet(get: () => Fork | null) {
  justSender(streamFor('get-fork')).subscribe(target =>
    sendTo(
      {
        type: 'get-fork__response',
        data: { fork: get() },
      },
      target,
    ),
  )
}

export async function get() {
  sendMessage({ type: 'get-fork' })
  const { data } = await waitForMessage('get-fork__response')
  return data.fork
}

export function onSet(set: (fork: Fork | null, sender?: Sender) => void) {
  streamFor('set-fork').subscribe(([msg, sender]) => {
    const type = 'set-fork__response'

    try {
      set(msg.data.fork)
      sendTo({ type, success: true, data: msg.data }, sender)
    } catch (e) {
      sendTo({ type, success: false, error: parseErrorMessage(e) }, sender)
    }
  })
}

export async function set(forkId: Fork | null) {
  sendMessage({ type: 'set-fork', data: { fork: forkId } })

  const res =  await waitForMessage('set-fork__response')
  if (!res.success) throw new Error(res.error)

  return res.data
}

export function onChanged(cb: (fork: Fork | null) => void) {
  justMessage(streamFor('fork-changed')).subscribe(msg => cb(msg.data.fork))
}

export function emitChanged(fork: Fork | null) {
  emit({
    type: 'fork-changed',
    data: { fork },
  })
}
