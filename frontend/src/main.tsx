import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.tsx'
import { Connect } from '@stacks/connect-react'
import { WalletProvider } from './contexts/WalletContext'

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
