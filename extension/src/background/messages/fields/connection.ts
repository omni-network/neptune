import browser from 'webextension-polyfill'
import {
  waitForMessage,
  sendMessage,
  streamFor,
  justMessage,
  justSender,
} from 'background/messages/core'
import { sendTo, emit } from 'background/messages/utils'
import { tabs } from 'background/messages/tabs'
import { parseErrorMessage } from 'shared/utils/error'

type Connection = {
  connected: boolean
  tabId: number
}

export function onGet(get: (tabId: number) => boolean) {
  streamFor('get-connection').subscribe(([msg, target]) => {
    const tabId = msg.data?.tabId ?? target?.tab?.id

    if (tabId == null) {
      throw new Error('If not sending from a tab, you must provide a tabId')
    }

    sendTo(
      {
        type: 'get-connection__response',
        data: { connected: get(tabId), tabId },
      },
      target,
    )
  })
}

export async function get(tabId: number) {
  sendMessage({ type: 'get-connection', data: { tabId } })

  const { data } = await waitForMessage(
    'get-connection__response',
    msg => msg.data.tabId === tabId,
  )

  return data.connected
}

export function onSet(set: (conn: Connection) => void) {
  streamFor('set-connection').subscribe(([msg, sender]) => {
    const type = 'set-connection__response'
    const tabId = msg.data?.tabId ?? sender?.tab?.id ?? null

    try {
      if (tabId == null) {
        throw new Error('If not sending from a tab, you must provide a tabId')
      }

      const data = { ...msg.data, tabId }
      set(data)
      sendTo({ type, success: true, data }, sender)
    } catch (e) {
      sendTo(
        {
          type,
          success: false,
          error: parseErrorMessage(e),
          data: { tabId },
        },
        sender,
      )
    }
  })
}

export async function set(connection: Connection) {
  sendMessage({ type: 'set-connection', data: connection })

  const res = await waitForMessage(
    'set-connection__response',
    msg => msg.success && msg.data.tabId === connection.tabId,
  )

  if (!res.success) throw new Error(res.error)
  return res.data
}

export function onChanged(cb: (connection: Connection) => void) {
  justMessage(streamFor('connection-changed')).subscribe(msg => cb(msg.data))
}

export function emitChanged(connection: Connection) {
  const msg = { type: 'connection-changed', data: connection } as const

  // only emit to connected tab, and to ui
  sendMessage(msg, { tabId: connection.tabId })
  sendMessage(msg)
}
