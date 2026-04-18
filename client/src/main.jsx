import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async' // 🔥 SEO Provider
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 👇 HelmetProvider sabse upar taaki poore app mein SEO chale */}
    <HelmetProvider>
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>
)