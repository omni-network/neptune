import { Fork, Account } from './types'
import msg from 'background/messages'
import url from 'background/utils/url'
import { latestBlock } from './queries'

type CreateForkParams = {
  name: string
  from?: Fork | null
  baseUrl?: URL | string | null | void
}

export const createFork = async ({
  from,
  name,
  baseUrl: _baseUrl,
}: CreateForkParams): Promise<Fork> => {
  const baseUrl = _baseUrl ?? (await msg.baseUrl.get())
  const providerRpcUrl = await msg.providerRpcUrl.get()

  const config = from
    ? {
        prefund_anvil_accounts: false,
        parent_fork_id: from.id,
      }
    : {
        prefund_anvil_accounts: true,
        eth_rpc_url: providerRpcUrl,
      }

  const body = JSON.stringify({
    name,
    config,
  })

  const forkId = await fetch(url.forks(baseUrl), {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(res => {
      const forkId = res.fork_id
      if (!forkId) throw new Error('Failed to create fork', res)
      return forkId
    })

  return {
    id: forkId,
    name,
  }
}

export const deleteFork = async (fork: Fork) => {
  const baseUrl = await msg.baseUrl.get()
  await fetch(url.fork(baseUrl, fork), {
    method: 'DELETE',
  })
}

export const forkMainnetLatest = async (
  baseUrl?: URL | string | void,
): Promise<Fork> => {
  const providerRpcUrl = await msg.providerRpcUrl.get()

  if (!providerRpcUrl) {
    throw new Error('No provider rpc url set')
  }

  const block = await latestBlock(providerRpcUrl)
  const name = `Mainnet @ block ${block}`
  return createFork({ name, baseUrl })
}

type BacktrackOptions =
  | {
      reset: true
      backOnce?: undefined
    }
  | {
      reset?: undefined
      backOnce: true
    }

export const backtrack = async (opts: BacktrackOptions) => {
  const method = opts.reset
    ? 'neptune_reset'
    : opts.backOnce
    ? 'neptune_stepBackOnce'
    : null

  if (!method) throw new Error('Invalid backtrack options')

  const r = await msg.rpc.sendRequest({
    jsonrpc: '2.0',
    method,
    params: [],
    id: 1,
  })

  if (r.error) throw new Error(r.error.message ?? r.error)
  if (!r.result) throw new Error('Backtrack failed')

  return r.result
}

export const impersonate = async (
  account: Account,
  url?: URL | string | null,
) => {
  if (!url) url = await msg.forkRpcUrl.get()
  if (!url) throw new Error('No fork rpc url set')

  const r = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'anvil_impersonateAccount',
      params: [account],
      id: 1,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => res.json())

  if (r.error) throw new Error(r.error.message ?? r.error)

  return r.result
}

export const impersonateAll = async (
  accounts: Account[],
  url?: URL | string | null,
) => {
  for (const account of accounts) {
    await impersonate(account, url)
  }
}
