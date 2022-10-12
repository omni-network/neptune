import { Fork } from './types'
import { ethers } from 'ethers'
import url from 'background/utils/url'
import msg from 'background/messages'

export const latestBlock = (url: URL | string) =>
  new ethers.providers.JsonRpcProvider(url.toString()).getBlockNumber()

type GetForksResponse = {
  forks: Record<string, Fork>
}

export const getAvailableForks = async (
  baseUrl?: URL | string,
): Promise<Fork[]> => {
  const base = baseUrl ?? (await msg.baseUrl.get())

  const forks = await fetch(url.forks(base))
    .then(res => res.json())
    .then((json: GetForksResponse) =>
      Object.entries(json.forks).map(([forkId, { name }]) => ({
        id: forkId,
        name,
      })),
    )

  return forks
}
