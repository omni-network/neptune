import { Tabs, Tab } from '@mui/material'
import { useLocation, Link } from 'react-router-dom'
import { MdHome, MdSettings, MdManageAccounts } from 'react-icons/md'
import { CgGitFork } from 'react-icons/cg'

const pages = [
  {
    path: '/',
    label: <MdHome />,
  },
  {
    path: '/accounts',
    label: <MdManageAccounts />,
  },
  {
    path: '/forks',
    label: <CgGitFork />,
  },
  {
    path: '/settings',
    label: <MdSettings />,
  },
]

const paths = pages.map(page => page.path)

const ExtensionTabs = () => {
  const location = useLocation()

  const value = paths.includes(location.pathname) ? location.pathname : '/'

  return (
    <Tabs
      variant="fullWidth"
      centered
      value={value}
      sx={{ marginBottom: '1.5rem', width: '100%' }}
    >
      {pages.map(page => {
        return (
          <Tab
            sx={{ minWidth: 'auto', width: 'auto', fontSize: '1.5rem' }}
            key={page.path}
            label={page.label}
            value={page.path}
            component={Link}
            to={page.path}
          />
        )
      })}
    </Tabs>
  )
}

export default ExtensionTabs
