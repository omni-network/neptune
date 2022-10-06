import {
  waitForMessage,
  sendMessage,
  streamFor,
  justMessage,
  justSender,
} from 'background/messages/core'
import { sendTo, emit } from 'background/messages/utils'
import { parseErrorMessage } from 'shared/utils/error'

export function onGet(get: () => string | null) {
  justSender(streamFor('get-provider-rpc-url')).subscribe(target =>
    sendTo(
      {
        type: 'get-provider-rpc-url__response',
        data: { providerRpcUrl: get() },
      },
      target,
    ),
  )
}

export async function get() {
  sendMessage({ type: 'get-provider-rpc-url' })
  const { data } = await waitForMessage('get-provider-rpc-url__response')
  return data.providerRpcUrl
}

export function onSet(set: (providerRpcUrl: string | null) => void) {
  streamFor('set-provider-rpc-url').subscribe(([msg, sender]) => {
    const type = 'set-provider-rpc-url__response'

    try {
      set(msg.data.providerRpcUrl)
      sendTo({ type, success: true, data: msg.data }, sender)
    } catch (e) {
      sendTo({ type, success: false, error: parseErrorMessage(e) }, sender)
    }
  })
}

export async function set(providerRpcUrl: string) {
  sendMessage({ type: 'set-provider-rpc-url', data: { providerRpcUrl } })

  const res = await waitForMessage('set-provider-rpc-url__response')
  if (!res.success) throw new Error(res.error)

  return res.data
}

export function onChanged(cb: (providerRpcUrl: string | null) => void) {
  justMessage(streamFor('provider-rpc-url-changed')).subscribe(msg =>
    cb(msg.data.providerRpcUrl),
  )
}

export function emitChanged(providerRpcUrl: string | null) {
  emit({
    type: 'provider-rpc-url-changed',
    data: { providerRpcUrl },
  })
}
