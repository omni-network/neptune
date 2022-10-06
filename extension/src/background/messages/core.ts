import browser from 'webextension-polyfill'
import { filter, map, Observable } from 'rxjs'
import { getMessage } from '@extend-chrome/messages'
import { Message, MessageFor } from 'shared/messages'

export const [sendMessage, messageStream, _waitForMessage] =
  getMessage<Message>('NEPTUNE')

export const waitForMessage = async <
  T extends Message['type'],
  M extends MessageFor<T> = MessageFor<T>,
>(
  type: T,
  predicate?: (m: M) => boolean,
) => {
  return (await _waitForMessage(
    ([msg]: any) => msg.type === type && (predicate ? predicate(msg) : true),
  ).then(([msg]: any) => msg)) as M
}

export const streamFor = <T extends Message['type']>(mt: T) =>
  messageStream.pipe(filter(([msg]) => msg.type === mt)) as Observable<
    [Extract<Message, { type: T }>, browser.runtime.MessageSender]
  >

export const justSender = (
  o: Observable<[Message, browser.runtime.MessageSender]>,
): Observable<browser.runtime.MessageSender> =>
  o.pipe(map(([, sender]) => sender))

export const justMessage = <M extends Message>(
  o: Observable<[M, browser.runtime.MessageSender]>,
): Observable<M> => o.pipe(map(([msg]) => msg))
