import { MetaMaskInpageProvider } from '@metamask/providers'
import { BaseProvider } from '@metamask/providers/dist/BaseProvider'
import { JsonRpcMiddleware } from 'json-rpc-engine'
import { shimEthereum } from './shim'
import msg from 'inpage/messages'


declare global {
  interface Window {
    neptune?: InjectedNeptuneProvider
    ethereum?: MetaMaskInpageProvider
  }
}

type InjectedNeptuneProviderOptions = {
  rpcMiddleware: JsonRpcMiddleware<unknown, unknown>[]
}

type InitialState = Parameters<BaseProvider['_initializeState']>[0]

const defaults = {
  accounts: [],
  chainId: '0x1',
  isUnlocked: false,
  networkVersion: undefined,
}

export abstract class AbstractInjectedNeptuneProvider extends BaseProvider {
  isNeptune = true
  shimmed: MetaMaskInpageProvider | null = null

  constructor({ rpcMiddleware }: InjectedNeptuneProviderOptions) {
    super({ rpcMiddleware })

    // let's not eagerly inject if window.ethereum has not yet been set. only
    // do when a user explicitly connects
    this._shimOrInjectEthereum({ injectIfNotShimmed: false })

    msg.chain.onChanged(chainId => this._handleChainChanged({ chainId }))
    msg.accounts.onChanged(this._handleAccountsChanged.bind(this))
    msg.connection.onChanged(this._handleConnectionChange.bind(this))
  }

  protected _shimOrInjectEthereum({ injectIfNotShimmed = true } = {}) {
    if (this.shimmed) return

    const { ethereum } = window

    if (ethereum) {
      window.ethereum = shimEthereum(ethereum, this)
      this.shimmed = ethereum
    } else if (injectIfNotShimmed) {
      window.ethereum = (this as unknown) as MetaMaskInpageProvider
      this.shimmed = null
    }
  }

  protected async _inititalize() {
    const connected = await msg.connection.get()
    this._initializeState(connected ? await this.getProviderState() : undefined)
  }

  protected async _handleConnectionChange(connected: boolean) {
    if (connected) {
      const { chainId, accounts, isUnlocked, networkVersion } =
        await this.getProviderState()

      this._shimOrInjectEthereum()

      if (this.shimmed) {
        this.shimmed.emit('connect', this.chainId)
        this.shimmed.emit('accountsChanged', this._state.accounts)
      }

      this._handleConnect(chainId)
      this._handleChainChanged({ chainId, networkVersion })
      this._handleUnlockStateChanged({ accounts, isUnlocked })
      this._handleAccountsChanged(accounts)
    } else {
      this._handleDisconnect(false, "User disconnected from Neptune's provider")

      const { shimmed } = this

      if (shimmed) {
        Promise.all([
          shimmed.request({ method: 'eth_chainId' }) as Promise<string>,
          shimmed.request({ method: 'eth_accounts' }) as Promise<string[]>,
        ])
          .then(([chainId, accounts]) => {
            shimmed.emit('connect', chainId)
            shimmed.emit('accountsChanged', accounts)
          })
          .catch(error => {
            console.debug('Could not reconnect to metamask', error)
          })

        window.ethereum = shimmed
        this.shimmed = null
      }
    }
  }

  async getProviderState() {
    const state = await this.request<InitialState>({
      method: 'neptune_getProviderState',
    }).catch(() => {
      console.error('Failed to get provider state - falling back to defaults')
    })

    return {
      ...defaults,
      ...state,
    }
  }

  async send(method: string, params?: unknown[]): Promise<unknown> {
    return this.request({ method, params })
  }
}

export class InjectedNeptuneProvider extends AbstractInjectedNeptuneProvider {
  constructor({ rpcMiddleware }: InjectedNeptuneProviderOptions) {
    super({ rpcMiddleware })
    this._inititalize()
  }
}
