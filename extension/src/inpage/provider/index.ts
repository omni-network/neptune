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
  }

  protected async _inititalize() {
    // let's not eagerly inject if window.ethereum has not yet been set. only
    // do when a user explicitly connects
    this._shimOrInjectEthereum({ injectIfNotShimmed: false })

    msg.chain.onChanged(chainId => this._handleChainChanged({ chainId }))
    msg.accounts.onChanged(this._handleAccountsChanged.bind(this))
    msg.connection.onChanged(this._handleConnectionChange.bind(this))

    const connected = await msg.connection.get()
    this._initializeState(connected ? await this.getProviderState() : undefined)

    if (!connected) return

    // when initializing on page load, the Neptune provider may be initialized
    // before MetaMask provider. when MetaMask does init, it will emit
    // 'connect' and 'accountsChanged' events that "override" those emitted
    // here. these timeouts help make sure Neptune's events are emitted last

    const emitState = this._emitNeptuneState.bind(this)
    emitState()
    setTimeout(emitState, 10)
    setTimeout(emitState, 50)
  }

  /**
   * If window.ethereum exists, we assume this means MetaMask is installed and
   * has successfully injfected its provider. Neptune shims the provider, by
   * wrapping it in a proxy.
   *
   * If window.etherem does not exist, MetaMask may not be installed, or it may
   * just not have run its injection script yet. We leave it up to the "caller"
   * to decide whether to injected Neptune at window.ethereum if it does not
   * yet exist.
   */
  protected _shimOrInjectEthereum({ injectIfNotShimmed = true } = {}) {
    if (this.shimmed) return

    const { ethereum } = window

    if (ethereum) {
      window.ethereum = shimEthereum(ethereum, this)
      this.shimmed = ethereum
    } else if (injectIfNotShimmed) {
      window.ethereum = this as unknown as MetaMaskInpageProvider
      this.shimmed = null
    }

    this._emitNeptuneState()
  }

  /**
   * Let those "listeneing" (like ethers, web3-react, wagmi, or other frontend
   * libraries consuming MetaMask's provider), that Neptune state is the true
   * and good state. To them, it just looks like MetaMask accounts & chainId
   * have changed.
   */
  protected _emitNeptuneState() {
    this.emit('connect', { chainId: this.chainId })
    this.emit('accountsChanged', this._state.accounts)
  }

  protected async _handleConnectionChange(connected: boolean) {
    if (connected) {
      const { chainId, accounts, isUnlocked, networkVersion } =
        await this.getProviderState()

      this._shimOrInjectEthereum()

      if (this.shimmed) {
        this.shimmed.emit('connect', { chainId })
        this.shimmed.emit('accountsChanged', accounts)
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
            shimmed.emit('connect', { chainId })
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

  /**
   * Some older consuming frontend libraries expect the provider to expost a
   * "send" method (though this is decprecated) -
   *
   * https://docs.metamask.io/guide/ethereum-provider.html#ethereum-send-deprecated
   */
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
