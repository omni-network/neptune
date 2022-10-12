import styled from 'styled-components'
import { CircularProgress } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useActiveTab } from 'ui/utils/tabs'
import { useIsServerRunning, useSyncController } from 'ui/queries'
import Tabs from 'ui/components/Tabs'
import NoServer from 'ui/pages/NoServer'
import ConnectPage from 'ui/pages/Connect'
import { Background, Centered } from 'ui/components/background'

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1rem;
`

/**
 * Default layout for each page.
 */
const Layout = () => {
  const sync = useSyncController() // sync each time the ui is loaded
  const server = useIsServerRunning()
  const tab = useActiveTab()

  if (!server.isRunning)
    return (
      <Centered>
        <NoServer />
      </Centered>
    )

  if (sync.isLoading || server.isLoading)
    return (
      <Centered>
        <CircularProgress />
      </Centered>
    )

  if (!tab.connected)
    return (
      <Centered>
        <ConnectPage />
      </Centered>
    )

  return (
    <Background>
      <Tabs />
      <Content>
        <Outlet />
      </Content>
    </Background>
  )
}

export default Layout
