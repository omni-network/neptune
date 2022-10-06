import {
  waitForMessage,
  sendMessage,
  streamFor,
  justMessage,
  justSender,
} from 'background/messages/core'
import { sendTo, emit } from 'background/messages/utils'
import { parseErrorMessage } from 'shared/utils/error'

export function onGet(get: () => string) {
  justSender(streamFor('get-base-url')).subscribe(target =>
    sendTo(
      {
        type: 'get-base-url__response',
        data: { baseUrl: get() },
      },
      target,
    ),
  )
}

export async function get() {
  sendMessage({ type: 'get-base-url' })
  const { data } = await waitForMessage('get-base-url__response')
  return data.baseUrl
}

export function onSet(set: (baseUrl: string) => void) {
  streamFor('set-base-url').subscribe(([msg, sender]) => {
    const type = 'set-base-url__response'

    try {
      set(msg.data.baseUrl)
      sendTo({ type, success: true, data: msg.data }, sender)
    } catch (e) {
      sendTo({ type, success: false, error: parseErrorMessage(e) }, sender)
    }
  })
}

export async function set(baseUrl: string) {
  sendMessage({ type: 'set-base-url', data: { baseUrl } })

  const res = await waitForMessage('set-base-url__response')
  if (!res.success) throw new Error(res.error)

  return res.data
}

export function onChanged(cb: (baseUrl: string) => void) {
  justMessage(streamFor('base-url-changed')).subscribe(msg =>
    cb(msg.data.baseUrl),
  )
}

export function emitChanged(baseUrl: string) {
  emit({ type: 'base-url-changed', data: { baseUrl } })
}
