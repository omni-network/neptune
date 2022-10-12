import { JsonRpcMiddleware, JsonRpcRequest } from 'json-rpc-engine'
import msg from 'inpage/messages'

type RpcRequest = JsonRpcRequest<any>
type RpcHandler = (req: RpcRequest) => Promise<unknown>
type RpcMiddleware = JsonRpcMiddleware<any, unknown>

type MiddlewareFactory = (
  handler: RpcHandler,
  ...methods: string[]
) => RpcMiddleware

/**
 * Creates a middleware that injcets the given handler for each given methods.
 */
const middlewareFor: MiddlewareFactory =
  (handler, ...methods) =>
  async (req, res, next, end) => {
    if (methods.includes(req.method)) {
      try {
        res.result = await handler(req)
      } catch (err) {
        console.log(err)
        res.error = err instanceof Error ? err : new Error(String(err))
      }

      return end()
    }
    return next()
  }

const getProviderState = async () => {
  const accounts = await msg.accounts.get()
  const chainId = await msg.chain.get()
  return { accounts, chainId, isUnlocked: true }
}

const handleSetEthereumChain = async (req: RpcRequest) => {
  throw new Error('Switching chain is not supported')

  // not supported yet, but the piping is there, so we'll leave this
  if (Array.isArray(req.params)) {
    const { chainId } = req.params[0]
    await msg.chain.set(chainId)
  }

  return null
}

const relayToBackground = (): RpcMiddleware => async (req, res, next, end) => {
  const resp = await msg.rpc.sendRequest(req)

  res.result = resp.result
  res.id = resp.id
  res.jsonrpc = resp.jsonrpc
  res.error = resp.error

  return end()
}

export const rpcMiddleware = [
  middlewareFor(getProviderState, 'neptune_getProviderState'),
  middlewareFor(msg.accounts.get, 'eth_accounts', 'eth_requestAccounts'),
  middlewareFor(msg.chain.get, 'eth_chainId'),
  middlewareFor(handleSetEthereumChain, 'wallet_switchEthereumChain'),
  relayToBackground(),
]
