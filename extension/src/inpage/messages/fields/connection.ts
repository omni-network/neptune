import { streamFor, sendMessage, waitForMessage } from 'inpage/messages/core'

export function onChanged(cb: (connected: boolean) => unknown) {
  streamFor('connection-changed').subscribe(msg => cb(msg.data.connected))
}

export async function get() {
  sendMessage({ type: 'get-connection' })
  const { data } = await waitForMessage('get-connection__response')
  return data.connected
}


export async function set(connected: boolean) {
  sendMessage({ type: 'set-connection', data: { connected } })
  const msg = await waitForMessage('set-connection__response')
  if (!msg.success) throw new Error(msg.error)
  return msg.data.connected
}
