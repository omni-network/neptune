import {
  waitForMessage,
  sendMessage,
  streamFor,
  justMessage,
  justSender,
} from 'background/messages/core'
import { sendTo, emit } from 'background/messages/utils'


export function onGet(get: () => string | null) {
  justSender(streamFor('get-fork-rpc-url')).subscribe(target =>
    sendTo(
      {
        type: 'get-fork-rpc-url__response',
        data: { forkRpcUrl: get() },
      },
      target,
    ),
  )
}

export async function get() {
  sendMessage({ type: 'get-fork-rpc-url' })
  const { data } = await waitForMessage('get-fork-rpc-url__response')
  return data.forkRpcUrl
}

export function onChanged(cb: (forkRpcUrl: string | null) => void) {
  justMessage(streamFor('fork-rpc-url-changed')).subscribe(msg =>
    cb(msg.data.forkRpcUrl),
  )
}

export function emitChanged(forkRpcUrl: string | null) {
  emit({
    type: 'fork-rpc-url-changed',
    data: { forkRpcUrl },
  })
}
