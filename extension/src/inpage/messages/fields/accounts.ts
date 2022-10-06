import { Account } from 'shared/types'
import { waitForMessage, sendMessage, streamFor } from 'inpage/messages/core'

export async function get() {
  sendMessage({ type: 'get-accounts' })
  const { data } = await waitForMessage('get-accounts__response')
  return data.accounts
}

export function onChanged(cb: (accounts: Account[]) => void) {
  streamFor('accounts-changed').subscribe(msg => cb(msg.data.accounts))
}
