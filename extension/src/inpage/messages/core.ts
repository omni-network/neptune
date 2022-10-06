import {
  fromEvent,
  filter,
  map,
  firstValueFrom,
  timeout,
  Observable,
} from 'rxjs'
import { getExtensionId } from 'shared/utils/extension'
import { Message, WindowMessage } from 'shared/messages'

const extensionId = getExtensionId()

export function sendMessage(msg: Message, { forwarded = false } = {}) {
  window.postMessage({ ...msg, forwarded, extensionId }, window.location.origin)
}

export const messageStream = fromEvent<MessageEvent>(window, 'message').pipe(
  filter(event => event.data.extensionId === extensionId),
  map(event => event.data),
) as Observable<WindowMessage>

export async function waitForMessage<
  K extends WindowMessage['type'],
  M extends { type: K } & WindowMessage,
>(type: K, predicate?: (m: M) => boolean): Promise<M> {
  const msg = await firstValueFrom(
    messageStream.pipe(
      timeout(30000),
      filter(
        msg => msg.type === type && (predicate ? predicate(msg as M) : true),
      ),
    ),
  )

  return msg as M
}

export const streamFor = <
  T extends WindowMessage['type'],
  M extends { type: T } & WindowMessage,
>(
  mt: T,
) => messageStream.pipe(filter(msg => msg.type === mt)) as Observable<M>
