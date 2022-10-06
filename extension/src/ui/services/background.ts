import browser from 'webextension-polyfill'
import { IS_DEV, DEV_SERVER_PORT, RELOAD_MESSAGE } from 'shared/constants/dev'

function initReloadListener() {
  const ws = new WebSocket(`ws://localhost:${DEV_SERVER_PORT}`)
  ws.addEventListener('message', event => {
    if (event.data === RELOAD_MESSAGE) {
      const url = browser.runtime.getURL('index.html')
      window.location.href = url
    }
  })
}

export function initBackgroundServices() {
  if (IS_DEV) initReloadListener()
}
