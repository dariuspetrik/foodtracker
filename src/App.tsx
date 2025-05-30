import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider, AppErrorBoundary } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import AddMeal from './components/AddMeal'
import History from './components/History'
import Settings from './components/Settings'

function App() {
  console.log('App: Component rendering...')
  
  try {
    return (
      <AppErrorBoundary>
        <AppProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<AddMeal />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                {/* Catch-all route for undefined paths */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Layout>
          </Router>
        </AppProvider>
      </AppErrorBoundary>
    )
  } catch (error) {
    console.error('App render error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            App Failed to Load
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the application. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            data-testid="reload-button"
          >
            Refresh Page
          </button>
          <div className="mt-4 text-xs text-gray-500">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
            <br />
            Time: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    )
  }
}

export default App