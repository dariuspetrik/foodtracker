import { test, expect } from '@playwright/test'

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Add console logging
    page.on('console', msg => {
      console.log(`BROWSER ${msg.type()}: ${msg.text()}`)
    })
    
    page.on('pageerror', error => {
      console.log(`PAGE ERROR: ${error.message}`)
    })

    console.log('Navigating to app...')
    await page.goto('/')
  })

  test('should load the app without crashes', async ({ page }) => {
    console.log('Test: Waiting for app to load...')
    
    // Wait for app title first
    console.log('Test: Looking for app title...')
    const title = page.getByTestId('app-title')
    await expect(title).toBeVisible({ timeout: 15000 })
    console.log('✅ App title is visible')
    
    // Give app more time to initialize  
    console.log('Test: Waiting for app initialization...')
    await page.waitForTimeout(5000)
    
    // Check loading state is resolved
    console.log('Test: Checking loading state...')
    const loadingIndicator = page.locator('text=Loading...')
    await expect(loadingIndicator).not.toBeVisible({ timeout: 15000 })
    console.log('✅ Loading state cleared')
    
    // Check dashboard content
    console.log('Test: Looking for dashboard content...')
    const welcomeText = page.locator('text=Welcome Back!')
    await expect(welcomeText).toBeVisible({ timeout: 10000 })
    console.log('✅ Dashboard content visible')
  })

  test('should show navigation buttons', async ({ page }) => {
    await page.waitForTimeout(5000)
    
    // Check all navigation items are present
    await expect(page.getByTestId('nav-home')).toBeVisible()
    await expect(page.getByTestId('nav-add')).toBeVisible()
    await expect(page.getByTestId('nav-history')).toBeVisible()
    await expect(page.getByTestId('nav-settings')).toBeVisible()
  })

  test('should navigate to settings and show content', async ({ page }) => {
    await page.waitForTimeout(5000)
    
    // Navigate to settings
    await page.getByTestId('nav-settings').click()
    
    // Wait for settings page to load
    await page.waitForTimeout(2000)
    
    // Check settings content is visible
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByTestId('calories-input')).toBeVisible()
  })

  test('should be able to open app status checker', async ({ page }) => {
    await page.waitForTimeout(5000)
    
    // Navigate to settings
    await page.getByTestId('nav-settings').click()
    await page.waitForTimeout(2000)
    
    // Open app status
    await page.getByTestId('show-app-status').click()
    
    // Check status modal is visible
    await expect(page.getByRole('heading', { name: 'App Status' })).toBeVisible()
    
    // Wait for status checks to complete
    await page.waitForTimeout(3000)
    
    // Should show some status information
    await expect(page.locator('text=IndexedDB')).toBeVisible()
    await expect(page.locator('text=Nutrition Database')).toBeVisible()
  })

  test('should be able to navigate to add meal page', async ({ page }) => {
    await page.waitForTimeout(5000)
    
    // Navigate to add meal
    await page.getByTestId('nav-add').click()
    await page.waitForTimeout(2000)
    
    // Check add meal page loads
    await expect(page.locator('text=Add New Meal')).toBeVisible()
  })
})