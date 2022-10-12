import { MetaMaskInpageProvider } from '@metamask/providers'
import { InjectedNeptuneProvider } from 'inpage/provider'

/**
 * Wrap a MetaMask provider in a proxy that forwards all requests to the
 * Neptune provider, if its connected.
 */
export function shimEthereum(
  ethereum: MetaMaskInpageProvider,
  provider: InjectedNeptuneProvider,
) {
  // some event listeners may have been registered on ethereum before
  // our proxy was introduced and neptune was connected. it's important we
  // forward neptune provider events onto these early listeners
  const sync = (event: string) => {
    provider.on(event, (...args) => {
      ethereum?.listeners(event).forEach(listener => listener(...args))
    })
  }

  sync('connect')
  sync('accountsChanged')

  return new Proxy(ethereum, {
    get(target, prop, receiver) {
      if (provider.isConnected()) {
        // @ts-ignore
        return provider[prop]
      }
      return Reflect.get(target, prop, receiver)
    },

    set(target, prop, value, receiver) {
      if (provider.isConnected()) {
        // @ts-ignore
        provider[prop] = value
        return true
      }
      return Reflect.set(target, prop, value, receiver)
    },
  })
}
