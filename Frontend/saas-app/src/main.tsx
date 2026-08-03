import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerSW({
  immediate: true,
  onNeedRefresh() {
    // Called when new content is available — hook this into your
    // custom popup/alert component to prompt the user to reload
    console.log('New version available — refresh to update')
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})