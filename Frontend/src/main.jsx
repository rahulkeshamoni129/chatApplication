import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Authprovider } from "./context/Authprovider.jsx"
import { BrowserRouter } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext.jsx'
import { TranslationProvider } from './context/TranslationContext.jsx'
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Authprovider>
      <SocketProvider>
        <TranslationProvider>
          <App />
        </TranslationProvider>
      </SocketProvider>
    </Authprovider>
  </BrowserRouter>
)
