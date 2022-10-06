/**
 * Inject inpage scripts. Setup stream list
 */

import browser from 'webextension-polyfill'
import { getExtensionId } from './shared/utils/extension'
import * as background from './background/messages/core'
import * as inpage from './inpage/messages/core'

const container = document.head || document.documentElement
const script = document.createElement('script')
const extensionId = getExtensionId()

script.src = browser.runtime.getURL('inpage.js')
script.id = 'neptune-extension'
script.setAttribute('data-extension-id', extensionId)

container.insertBefore(script, container.children[0])

inpage.messageStream.subscribe(msg => {
  if (!msg.forwarded) background.sendMessage(msg)
})

background.justMessage(background.messageStream).subscribe(msg => {
  inpage.sendMessage(msg, { forwarded: true })
})
