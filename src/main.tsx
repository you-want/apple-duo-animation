import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './fold/fold.css'
import './fold/apps/apps.css'
import './fold/coverflow.css'
import './fold/handoff.css'
import './styles/sections.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
