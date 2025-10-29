import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TimeRecode } from './TimeRecode.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TimeRecode />
  </StrictMode>,
)
