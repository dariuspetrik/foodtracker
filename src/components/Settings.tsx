import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { clearAllData } from '../utils/storage'
import { UserSettings } from '../types'
import AppStatus from './AppStatus'

const Settings: React.FC = () => {
  const { state, updateSettings, toggleDarkMode } = useApp()
  const [settings, setSettings] = useState<UserSettings>(state.settings)
  const [isSaving, setIsSaving] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showAppStatus, setShowAppStatus] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSettings(settings)
      // Show success feedback briefly
      setTimeout(() => setIsSaving(false), 500)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setIsSaving(false)
    }
  }

  const handleClearData = async () => {
    try {
      await clearAllData()
      setShowClearConfirm(false)
      // Reload the page to reset the app state
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear data:', error)
    }
  }

  const handleInputChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your nutrition goals and preferences
        </p>
      </div>

      {/* Daily Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Daily Nutrition Goals</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Calories
            </label>
            <input
              type="number"
              value={settings.dailyCalories}
              onChange={(e) => handleInputChange('dailyCalories', Number(e.target.value))}
              min="800"
              max="5000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              data-testid="calories-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              value={settings.dailyProtein}
              onChange={(e) => handleInputChange('dailyProtein', Number(e.target.value))}
              min="20"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              data-testid="protein-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Carbs (g)
            </label>
            <input
              type="number"
              value={settings.dailyCarbs}
              onChange={(e) => handleInputChange('dailyCarbs', Number(e.target.value))}
              min="20"
              max="500"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              data-testid="carbs-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fat (g)
            </label>
            <input
              type="number"
              value={settings.dailyFat}
              onChange={(e) => handleInputChange('dailyFat', Number(e.target.value))}
              min="10"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              data-testid="fat-input"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Units
            </label>
            <select
              value={settings.units}
              onChange={(e) => handleInputChange('units', e.target.value as 'metric' | 'imperial')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              data-testid="units-select"
            >
              <option value="metric">Metric (g, kg)</option>
              <option value="imperial">Imperial (oz, lb)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dark Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toggle dark theme
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.darkMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              data-testid="dark-mode-toggle"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        data-testid="save-settings"
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>

      {/* App Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">About</h3>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Food Tracker PWA</strong> - AI-powered nutrition logging
          </p>
          <p>
            Version 1.0.0 • All data stored locally on your device
          </p>
          <p>
            Uses TensorFlow.js for offline food recognition
          </p>
        </div>

        <button
          onClick={() => setShowAppStatus(true)}
          className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          data-testid="show-app-status"
        >
          🔍 Check App Status
        </button>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span className="text-sm text-green-700 dark:text-green-300">
              100% offline • No data tracking • Privacy first
            </span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Data Management</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Total Meals</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(state.meals || []).length} meals logged
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              data-testid="clear-data-button"
            >
              Clear All Data
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              This will permanently delete all your meals and reset settings
            </p>
          </div>
        </div>
      </div>

      {/* App Status Modal */}
      <AppStatus 
        isOpen={showAppStatus} 
        onClose={() => setShowAppStatus(false)} 
      />

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Clear All Data?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete all your meals, photos, and reset your settings. 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                data-testid="confirm-clear-data"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings