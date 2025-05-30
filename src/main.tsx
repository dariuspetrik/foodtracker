import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.error?.message,
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise
  })
  // Prevent default to avoid console noise
  event.preventDefault()
})

// Check for required browser features
const checkBrowserSupport = (): string | null => {
  if (typeof window === 'undefined') return 'Window object not available'
  if (!('indexedDB' in window)) return 'IndexedDB not supported'
  if (!('fetch' in window)) return 'Fetch API not supported'
  if (!('Promise' in window)) return 'Promises not supported'
  return null
}

// Initialize app
const initApp = async () => {
  const browserError = checkBrowserSupport()
  if (browserError) {
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: red;">Browser Not Supported</h2>
        <p>${browserError}</p>
        <p>Please use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
      </div>
    `
    return
  }

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('Root element not found!')
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: red;">Setup Error</h2>
        <p>Root element not found. Please check HTML.</p>
      </div>
    `
    return
  }

  try {
    console.log('Initializing React app...')
    const root = ReactDOM.createRoot(rootElement)
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    
    console.log('React app initialized successfully')
  } catch (error) {
    console.error('React app failed to render:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: red;">App Failed to Load</h2>
        <p>There was an error loading the application.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Reload Page
        </button>
        <details style="margin-top: 20px; text-align: left; background: #f5f5f5; padding: 10px; border-radius: 5px;">
          <summary style="cursor: pointer;">Error Details</summary>
          <pre style="font-size: 12px; overflow: auto;">${error instanceof Error ? error.stack : String(error)}</pre>
        </details>
      </div>
    `
  }
}

// Start the app
initApp()