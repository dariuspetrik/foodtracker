import React, { useEffect, useState } from 'react'
import { checkAppHealth } from '../utils/debug'

const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(checkAppHealth())
    }, 5000)

    // Initial check
    setHealth(checkAppHealth())

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-gray-600 text-white px-3 py-2 rounded text-xs z-50"
        data-testid="health-check-toggle"
      >
        Health
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg text-xs max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">Health Check</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      {health && (
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <div>
            <strong>Browser Support:</strong>
            <div className="ml-2">
              <div>IndexedDB: {health.browser.indexedDB ? '✓' : '✗'}</div>
              <div>Fetch: {health.browser.fetch ? '✓' : '✗'}</div>
              <div>Online: {health.window.online ? '✓' : '✗'}</div>
            </div>
          </div>
          
          <div>
            <strong>Document:</strong>
            <div className="ml-2">
              <div>State: {health.document.readyState}</div>
              <div>Root: {health.document.rootElement ? '✓' : '✗'}</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Last check: {new Date(health.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthCheck