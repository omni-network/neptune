import { useMutation } from 'react-query'
import { Account, Fork } from 'shared/types'
import { ethers } from 'ethers'
import msg from 'background/messages'
import { createFork, forkMainnetLatest, backtrack } from 'shared/mutations'
import { client } from './client'

// lil trick to force reload
// we cannot "emit changed" because the ui does not run within the same context
// as the background script
const forceReloads = async () => msg.baseUrl.get().then(msg.baseUrl.set)

interface UseCreateForkOptions {
  onSuccess?: (fork: Fork) => void
  switchOnSuccess?: boolean
}

export const useCreateFork = ({
  onSuccess,
  switchOnSuccess = true,
}: UseCreateForkOptions = {}) =>
  useMutation(createFork, {
    onSuccess: fork => {
      if (switchOnSuccess) msg.fork.set(fork)
      if (onSuccess) onSuccess(fork)
      client.invalidateQueries('available-forks')
    },
  })

export const useSetActiveFork = () => useMutation(msg.fork.set)

export const selectAccount = async (
  account: Account,
  { addIfNotFound = false } = {},
) => {
  const accounts = await msg.accounts.get()

  if (!ethers.utils.isAddress(account))
    throw new Error('Invalid account address')

  if (!addIfNotFound && !accounts.includes(account))
    throw new Error('Account not found')

  if (account === accounts[0]) return

  return await msg.accounts.set([
    account,
    ...accounts.filter(a => a !== account),
  ])
}

export const useSelectAccount = () =>
  useMutation((acc: Account) => selectAccount(acc))

export const useAddAccount = () =>
  useMutation((acc: Account) => selectAccount(acc, { addIfNotFound: true }))

export const useForkMainnetLatest = () =>
  useMutation(forkMainnetLatest, {
    onSuccess: fork => msg.fork.set(fork),
  })

export const useStepBack = () =>
  useMutation(() => backtrack({ backOnce: true }), {
    onSuccess: () => forceReloads(),
  })

export const useReset = () =>
  useMutation(() => backtrack({ reset: true }), {
    onSuccess: () => forceReloads(),
  })

export const useConnection = () => useMutation(msg.connection.set)
export const useSetBaseUrl = () => useMutation(msg.baseUrl.set)
export const useSetProviderRpcUrl = () => useMutation(msg.providerRpcUrl.set)
