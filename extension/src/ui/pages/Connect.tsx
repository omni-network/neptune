import styled from 'styled-components'
import { Button } from '@mui/material'
import { useActiveTab } from 'ui/utils/tabs'
import { useProviderRpcUrl } from 'ui/queries'
import { useBaseUrl, useActiveFork } from 'ui/queries'
import ProviderRpcUrlInput from 'ui/components/ProviderRpcUrlInput'
import BaseUrlInput from 'ui/components/BaseUrlInput'
import ForkMainnet from 'ui/components/ForkMainnet'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`

const RequiredAction = () => {
  const tab = useActiveTab()
  const provider = useProviderRpcUrl()
  const base = useBaseUrl()
  const fork = useActiveFork()

  if (tab.isLoading || provider.isLoading || base.isLoading || fork.isLoading)
    return null

  if (!provider.data) return <ProviderRpcUrlInput />
  if (!base.data) return <BaseUrlInput />
  if (!fork.data) return <ForkMainnet />

  return (
    <Button sx={{ padding: '1rem 3rem' }} onClick={tab.connect}>
      Connect
    </Button>
  )
}

const Connect = () => {
  return (
    <Container>
      <RequiredAction />
    </Container>
  )
}

export default Connect
