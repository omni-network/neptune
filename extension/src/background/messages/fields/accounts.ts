import { Account } from 'shared/types'
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

export function onGet(get: () => Account[]) {
  justSender(streamFor('get-accounts')).subscribe(target => {
    sendTo(
      {
        type: 'get-accounts__response',
        data: { accounts: get() },
      },
      target,
    )
  })
}

export async function get() {
  sendMessage({ type: 'get-accounts' })
  const { data } = await waitForMessage('get-accounts__response')
  return data.accounts
}

export function onSet(set: (accounts: Account[]) => void) {
  streamFor('set-accounts').subscribe(([msg, sender]) => {
    const type = 'set-accounts__response'
    try {
      set(msg.data.accounts)
      sendTo({ type, success: true, data: msg.data }, sender)
    } catch (e) {
      sendTo({ type, success: false, error: parseErrorMessage(e) }, sender)
    }
  })
}

export async function set(accounts: Account[]) {
  sendMessage({ type: 'set-accounts', data: { accounts } })

  const res = await waitForMessage('set-accounts__response')
  if (!res.success) throw new Error(res.error)

  return res.data
}

export function onChanged(cb: (accounts: Account[]) => void) {
  justMessage(streamFor('accounts-changed')).subscribe(msg => {
    cb(msg.data.accounts)
  })
}
export function emitChanged(accounts: Account[]) {
  emit({
    type: 'accounts-changed',
    data: { accounts },
  })
}
