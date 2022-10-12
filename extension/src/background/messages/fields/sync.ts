import {
  waitForMessage,
  sendMessage,
  streamFor,
  justSender,
} from 'background/messages/core'
import { sendTo } from 'background/messages/utils'

export function onSync(sync: () => Promise<void>) {
  justSender(streamFor('sync-request')).subscribe(async sender => {
    try {
      await sync()
    } catch (error) {
      console.error('Sync Error: ', error)
      // TODO: perhaps we can return some flag saying whether or not the sync
      // was successful. for now, we treat "sync" messages more like "ping"s
      // the response is useful in that telling the sender that the sync
      // request was received.
    } finally {
      sendTo({ type: 'sync-response' }, sender)
    }
  })
}

export async function sync() {
  sendMessage({ type: 'sync-request' })
  await waitForMessage('sync-response')
}
