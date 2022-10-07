import browser from 'webextension-polyfill'
import { useState, useEffect } from 'react'
import { useIsConnected } from 'ui/queries'
import { useConnection } from 'ui/mutations'

const getActiveTabId = () =>
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(tabs => tabs[0].id ?? null)

const useActiveTabId = () => {
  const [tabId, setTabId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => setTabId(await getActiveTabId())

    init()

    const onChange = (tab: browser.tabs.TabActiveInfo) => setTabId(tab.tabId)

    browser.tabs.onActivated.addListener(onChange)
    return () => browser.tabs.onActivated.removeListener(onChange)
  }, [])

  return tabId
}

export const useActiveTab = () => {
  const tabId = useActiveTabId()
  const connection = useConnection()
  const { data: connected, isLoading } = useIsConnected(tabId)

  return {
    tabId,
    connected,
    isLoading,
    connect: () => tabId && connection.mutate({ tabId, connected: true }),
    disconnect: () => tabId && connection.mutate({ tabId, connected: false }),
  }
}
