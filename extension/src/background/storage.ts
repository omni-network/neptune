import { getBucket } from '@extend-chrome/storage'
import { Account, Fork, ChainId } from 'shared/types'
import msg from 'background/messages'

type Store = Partial<{
  accounts: Account[]
  fork: Fork | null
  providerRpcUrl: string | null
  baseUrl: string
  chainId: ChainId
}>

export const store = getBucket<Store>('store', 'local')

msg.accounts.onChanged(accounts => store.set({ accounts }))
msg.fork.onChanged(fork => store.set({ fork }))
msg.providerRpcUrl.onChanged(providerRpcUrl => store.set({ providerRpcUrl }))
msg.baseUrl.onChanged(baseUrl => store.set({ baseUrl }))
msg.chain.onChanged(chainId => store.set({ chainId }))
