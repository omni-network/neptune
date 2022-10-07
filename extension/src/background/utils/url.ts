import { Fork } from 'shared/types'

const forks = (base: URL | string) => new URL('/forks', base)

const fork = (base: URL | string, fork: Fork) =>
  new URL(`/forks/${fork.id}`, base)

export default {
  forks,
  fork,
}
