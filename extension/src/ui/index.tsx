import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { initBackgroundServices } from './services/background'

initBackgroundServices()

const root = document.getElementById('root')

if (!root) {
  throw new Error('No root element found')
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
