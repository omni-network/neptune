import { Message, Sender } from 'shared/messages'
import { tabs } from './tabs'
import { sendMessage } from './core'

export function sendTo(
  msg: Message,
  target?: Sender, // undefined means to ui
) {
  sendMessage(msg, target?.tab?.id ? { tabId: target.tab.id } : undefined)
}

export function emit(msg: Message) {
  for (const tabId of tabs) {
    sendMessage(msg, { tabId })
  }

  // send to ui
  sendMessage(msg)
}
