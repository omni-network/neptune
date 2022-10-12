import { waitForMessage, sendMessage } from 'background/messages/core'

export async function sync() {
  sendMessage({ type: 'sync-request' })
  await waitForMessage('sync-response')
}
