// Test configuration and utilities for Food Tracker PWA tests

export const TEST_CONFIG = {
  // Default settings values from AppContext
  DEFAULT_CALORIES: 2000,
  DEFAULT_PROTEIN: 150,
  DEFAULT_CARBS: 250,
  DEFAULT_FAT: 70,
  
  // Test timeouts
  SAVE_TIMEOUT: 3000,
  ML_PROCESSING_TIMEOUT: 10000,
  
  // Test image for upload (minimal valid image)
  TEST_IMAGE_BUFFER: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
  
  // Navigation paths
  PATHS: {
    DASHBOARD: '/',
    ADD_MEAL: '/add',
    HISTORY: '/history',
    SETTINGS: '/settings'
  }
}

export const TEST_HELPERS = {
  /**
   * Wait for ML processing to complete (either success or error)
   */
  waitForMLProcessing: (page: any) => {
    return page.waitForFunction(() => {
      // Look for elements containing the loading text
      const allElements = Array.from(document.querySelectorAll('*'))
      const loadingText = allElements.some(el => el.textContent?.includes('Loading AI model...'))
      const analyzingText = allElements.some(el => el.textContent?.includes('Analyzing your meal...'))
      return !loadingText && !analyzingText
    }, { timeout: TEST_CONFIG.ML_PROCESSING_TIMEOUT })
  },

  /**
   * Wait for settings save to complete
   */
  waitForSettingsSave: (page: any) => {
    return page.waitForFunction(() => {
      const button = document.querySelector('[data-testid="save-settings"]')
      return button && button.textContent === 'Save Settings'
    }, { timeout: TEST_CONFIG.SAVE_TIMEOUT })
  },

  /**
   * Upload test image file
   */
  uploadTestImage: async (page: any) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-meal.jpg',
      mimeType: 'image/jpeg',
      buffer: TEST_CONFIG.TEST_IMAGE_BUFFER
    })
  }
}