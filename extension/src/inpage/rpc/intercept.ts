import msg from 'inpage/messages'

const isPost = (init?: RequestInit): init is RequestInit =>
  Boolean(init && init.method === 'POST' && init.body)

const isRpcRequest = (body?: any) => {
  // handle batch requests
  const reqs = Array.isArray(body) ? body : [body]

  return reqs.every(
    (req: any) =>
      req &&
      req.jsonrpc === '2.0' &&
      req.id &&
      typeof req.method === 'string' &&
      Array.isArray(req.params),
  )
}

const requestInitToBody = async ({ body }: RequestInit) => {
  let parsed

  if (typeof body === 'string') {
    parsed = JSON.parse(body)
  } else if (body instanceof FormData) {
    parsed = body
  } else if (body instanceof Blob) {
    parsed = JSON.parse(await body.text())
  } else if (body instanceof ArrayBuffer) {
    parsed = JSON.parse(await new Blob([body]).text())
  } else if (body instanceof URLSearchParams) {
    parsed = Object.fromEntries(body.entries())
  } else if (body instanceof ReadableStream) {
    parsed = JSON.parse(await new Response(body).text())
  } else if (body) {
    parsed = await new Blob([body]).text().then(JSON.parse)
  } else {
    return body
  }

  return parsed
}

type Fetch = typeof window.fetch

const resourcesToIntercept = new Map<string, boolean>()

const tryGetChainId = async (url: URL | RequestInfo) => {
  try {
    const chainId = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'eth_chainId',
        params: [],
      }),
    })
      .then(res => res.json())
      .then(res => res.result)

    return chainId as string
  } catch (e) {
    return null
  }
}

const interceptRpcRequests =
  (fetch: Fetch): Fetch =>
  async (...args) => {
    const [resource, init] = args

    if (!isPost(init)) return fetch(...args)

    const body = await requestInitToBody(init)
    if (!isRpcRequest(body)) return fetch(...args)

    const connected = await msg.connection.get()
    if (!connected) return fetch(...args)

    // only intercept mainnet requests
    if (!resourcesToIntercept.has(resource.toString())) {
      const shouldIntercept = (await tryGetChainId(resource)) === '0x1'
      resourcesToIntercept.set(resource.toString(), shouldIntercept)
    }

    if (!resourcesToIntercept.get(resource.toString())) return fetch(...args)

    return new Response(JSON.stringify(await msg.rpc.sendRequest(body)))
  }

export const initRpcIntercept = () => {
  window.fetch = interceptRpcRequests(window.fetch)
}
