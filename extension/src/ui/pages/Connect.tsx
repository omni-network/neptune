import { Button } from '@mui/material'
import { useActiveTab } from 'ui/utils/tabs'
import { useProviderRpcUrl } from 'ui/queries'
import { useBaseUrl, useActiveFork } from 'ui/queries'
import ProviderRpcUrlInput from 'ui/components/ProviderRpcUrlInput'
import BaseUrlInput from 'ui/components/BaseUrlInput'
import ForkMainnet from 'ui/components/ForkMainnet'

const ConnectPage = () => {
  const tab = useActiveTab()
  const provider = useProviderRpcUrl()
  const base = useBaseUrl()
  const fork = useActiveFork()

  // these are all extension queries, so they load fast. not worth an indicator
  if (tab.isLoading || provider.isLoading || base.isLoading || fork.isLoading)
    return null

  if (!provider.data) return <ProviderRpcUrlInput />
  if (!base.data) return <BaseUrlInput />
  if (!fork.data) return <ForkMainnet />

  return <Button onClick={tab.connect}>Connect</Button>
}

export default ConnectPage
