// Polyfill for BigInt to Number conversion issues
if (typeof BigInt !== 'undefined') {
  // @ts-ignore - Override BigInt.prototype.toJSON
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.tsx'
import { Connect } from '@stacks/connect-react'
import { WalletProvider } from './contexts/WalletContext'
import performanceMonitor from './utils/performanceMonitor'
import { registerSW } from 'virtual:pwa-register'

// Initialize performance monitoring
performanceMonitor.init()

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.log('New content available, please refresh.')
    },
    onOfflineReady() {
      console.log('App ready to work offline.')
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration)
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error)
    },
  })
}

const appDetails = {
  name: 'Tipz Stacks',
  icon: window.location.origin + '/logo.png',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Connect authOptions={{ appDetails }}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </Connect>
  </StrictMode>,
)
