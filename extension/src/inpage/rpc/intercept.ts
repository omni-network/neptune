import msg from 'inpage/messages'

const isPost = (init?: RequestInit): init is RequestInit =>
  Boolean(init && init.method === 'POST' && init.body)

const isRpcRequest = (body?: any) =>
  body &&
  body.jsonrpc === '2.0' &&
  typeof body.id === 'number' &&
  typeof body.method === 'string' &&
  Array.isArray(body.params)

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

const interceptRpcRequests =
  (fetch: Fetch): Fetch =>
  async (...args) => {
    const [_, init] = args

    if (!isPost(init)) return fetch(...args)

    const body = await requestInitToBody(init)

    if (!isRpcRequest(body)) return fetch(...args)

    const connected = await msg.connection.get()

    if (!connected) return fetch(...args)

    return new Response(JSON.stringify(await msg.rpc.sendRequest(body)))
  }

export const initRpcIntercept = () => {
  window.fetch = interceptRpcRequests(window.fetch)
}
