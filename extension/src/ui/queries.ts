import msg from 'background/messages'
import { getAvailableForks } from 'shared/queries'
import { useQuery } from 'react-query'
import { client } from './client'

export const useAccounts = () => useQuery('accounts', msg.accounts.get)
export const useChainId = () => useQuery('chainId', msg.chain.get)
export const useActiveFork = () => useQuery('fork', msg.fork.get)
export const useBaseUrl = () => useQuery('base-url', msg.baseUrl.get)
export const useSyncController = () =>
  useQuery('sync-controller', msg.sync.sync)

export const useProviderRpcUrl = () =>
  useQuery('provider-rpc-url', msg.providerRpcUrl.get)

export const useAvailableForks = () =>
  useQuery('available-forks', () => getAvailableForks())

export const useIsServerRunning = () => {
  const { isSuccess, isLoading, isError } = useAvailableForks()
  return { isRunning: !isLoading && !isError && isSuccess, isLoading, isError }
}

export const useIsConnected = (tabId: number | null) => {
  return useQuery(
    `${tabId}-connection`,
    () => (tabId ? msg.connection.get(tabId) : null),
    {
      enabled: tabId !== null,
    },
  )
}

const invalidateQueries = (...qks: string[]) =>
  qks.forEach(qk => client.invalidateQueries(qk))

msg.accounts.onChanged(() => invalidateQueries('accounts'))
msg.chain.onChanged(() => invalidateQueries('chainId'))
msg.fork.onChanged(() => invalidateQueries('fork', 'available-forks'))
msg.baseUrl.onChanged(() => invalidateQueries('available-forks'))
msg.providerRpcUrl.onChanged(() => invalidateQueries('provider-rpc-url'))
msg.connection.onChanged(conn => invalidateQueries(`${conn.tabId}-connection`))
