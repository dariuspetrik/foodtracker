import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppStatus from './AppStatus'
import HealthCheck from './HealthCheck'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { state } = useApp()
  const [forceShow, setForceShow] = useState(false)

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShow(true)
    }, 3000) // Increased timeout for better UX

    return () => clearTimeout(timer)
  }, [])

  // Handle undefined state
  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing app...</p>
        </div>
      </div>
    )
  }

  // Show loading screen only briefly
  if (state.isLoading && !forceShow) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading app data...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/add', icon: '📷', label: 'Add' },
    { path: '/history', icon: '📊', label: 'History' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ]



  return (
    <div className={`min-h-screen ${state?.darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Debug Status */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <AppStatus />
            <HealthCheck />
          </>
        )}
        
        {/* Header */}
        <header className="bg-blue-500 dark:bg-blue-600 text-white p-4 safe-area-top">
          <h1 className="text-xl font-bold text-center" data-testid="app-title">
            Food Tracker
          </h1>
        </header>

        {/* Main Content */}
        <main className="pb-20 min-h-screen">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Layout