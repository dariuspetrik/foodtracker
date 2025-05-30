import React from 'react'
import { useApp } from '../context/AppContext'

const AppStatus: React.FC = () => {
  try {
    const { state, getTodaysNutrition } = useApp()
    const nutrition = getTodaysNutrition()

    return (
      <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg text-xs max-w-xs z-50">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">App Status</h4>
        <div className="space-y-1 text-gray-600 dark:text-gray-400">
          <div>State: {state ? '✓' : '✗'}</div>
          <div>Loading: {state?.isLoading ? 'Yes' : 'No'}</div>
          <div>Settings: {state?.settings ? '✓' : '✗'}</div>
          <div>Meals: {state?.meals?.length || 0}</div>
          <div>Dark Mode: {state?.darkMode ? 'On' : 'Off'}</div>
          <div>Today Cal: {nutrition?.calories || 0}</div>
          <div>IndexedDB: {typeof window !== 'undefined' && 'indexedDB' in window ? '✓' : '✗'}</div>
          <div>Timestamp: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-3 shadow-lg text-xs max-w-xs z-50">
        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Error</h4>
        <div className="text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }
}

export default AppStatus