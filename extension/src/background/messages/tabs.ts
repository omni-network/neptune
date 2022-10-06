import browser from 'webextension-polyfill'
import { messageStream, justSender } from './core'

export const tabs = new Set<number>()

justSender(messageStream).subscribe(sender => {
  if (sender.tab?.id) tabs.add(sender.tab.id)
})

browser.tabs.onRemoved.addListener(tabId => {
  tabs.delete(tabId)
})
