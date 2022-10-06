import { Outlet } from 'react-router-dom'
import { useActiveTab } from 'ui/utils/tabs'
import Tabs from 'ui/components/Tabs'
import ConnectPage from 'ui/pages/Connect'

/**
 * Default layout for each page.
 */
const Layout = () => {
  const { connected } = useActiveTab()

  if (!connected) return <ConnectPage />

  return (
    <>
      <Tabs />
      <Outlet />
    </>
  )
}

export default Layout
