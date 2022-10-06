import { ThemeProvider as MuiThemeProvider, } from '@mui/material'
import { QueryClientProvider } from 'react-query'
import {
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom'
import { client } from './client'
import ErrorBoundary from './components/ErrorBoundary'
import Accounts from './pages/Accounts'
import Forks from './pages/Forks'
import Home from './pages/Home'
import Settings from './pages/Settings'
import Layout from './pages/Layout'
import { FixedGlobalStyle, theme } from './theme'


export const App = () => (
  <QueryClientProvider client={client}>
    <MuiThemeProvider theme={theme}>
      <FixedGlobalStyle />
      <ErrorBoundary fallback={<div>Oops... something went wrong</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/forks" element={<Forks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </MuiThemeProvider>
  </QueryClientProvider>
)
