import { QueryClient } from 'react-query'

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      // if you want to consider queries stale after some time, over at the
      // query level. most all queries we manually invalidate when needed (post
      // action or by listening for events), or the query need not ever be
      // requeried during a session (epoch duration, vault token addresses,
      // etc)
      staleTime: Infinity,
      retry: false,
      retryOnMount: false,
    },
  },
})
