import { Account, ChainId } from '../../shared/types'

export const formatLongString = (
  s: string,
  { clipLength = 12, takeFirst = 4, takeLast = 4 } = {},
) => {
  if (s.length <= clipLength) return s
  const chars = s.split('')
  const last = s.slice(chars.length - takeLast)
  const first = s.slice(0, takeFirst)
  return [...first, '...', ...last].join('')
}

export const formatAccount = (account: Account) =>
  formatLongString(account, {
    takeFirst: 5,
  })

export const formatChainId = (chainId: ChainId) => parseInt(chainId, 16)
