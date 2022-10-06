import msg from 'background/messages'
import { getAvailableForks } from 'shared/queries'
import { useQuery } from 'react-query'
import { client } from './client'

export const useAccounts = () => useQuery('accounts', msg.accounts.get)
export const useChainId = () => useQuery('chainId', msg.chain.get)
export const useActiveFork = () => useQuery('fork', msg.fork.get)
export const useBaseUrl = () => useQuery('base-url', msg.baseUrl.get)

export const useProviderRpcUrl = () =>
  useQuery('provider-rpc-url', msg.providerRpcUrl.get)

export const useAvailableForks = () =>
  useQuery('available-forks', () => getAvailableForks())

export const useIsConnected = (tabId: number | null) => {
  return useQuery(
    `${tabId}-connection`,
    () => (tabId ? msg.connection.get(tabId) : null),
    {
      enabled: tabId !== null,
    },
  )
}

const invalidateQuery = (key: string) => client.invalidateQueries(key)

msg.accounts.onChanged(() => invalidateQuery('accounts'))
msg.chain.onChanged(() => invalidateQuery('chainId'))
msg.fork.onChanged(() => invalidateQuery('fork'))
msg.connection.onChanged(({ tabId }) => invalidateQuery(`${tabId}-connection`))
msg.baseUrl.onChanged(() => invalidateQuery('available-forks'))
msg.providerRpcUrl.onChanged(() => invalidateQuery('provider-rpc-url'))
