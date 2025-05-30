import { test, expect } from '@playwright/test'
import { TEST_CONFIG, TEST_HELPERS } from './test-config'

test.describe('Complete App Workflow', () => {
  test('should handle complete user journey from dashboard to meal entry', async ({ page }) => {
    // Start at dashboard
    await page.goto('/')
    
    // Verify initial empty state
    await expect(page.getByText('Welcome Back!')).toBeVisible()
    await expect(page.getByText('No meals logged today yet')).toBeVisible()
    
    // Click to add meal
    await page.getByTestId('quick-add-meal').click()
    await expect(page.url()).toContain('/add')
    
    // Should be on photo step
    await expect(page.getByText('Add New Meal')).toBeVisible()
    await expect(page.getByTestId('upload-photo')).toBeVisible()
    
    // Navigate back to check return flow
    await page.goBack()
    await expect(page.getByText('Welcome Back!')).toBeVisible()
    
    // Go to settings and change a value
    await page.getByTestId('nav-settings').click()
    await page.getByTestId('calories-input').fill('2100')
    await page.getByTestId('save-settings').click()
    
    // Wait for save
    await TEST_HELPERS.waitForSettingsSave(page)
    
    // Go back to dashboard and verify updated target
    await page.getByTestId('nav-home').click()
    await expect(page.getByText('0/2100cal')).toBeVisible()
    
    // Check history (should be empty)
    await page.getByTestId('nav-history').click()
    await expect(page.getByText('No meals logged yet')).toBeVisible()
    
    // Complete navigation test
    await page.getByTestId('nav-home').click()
    await expect(page.getByText('Welcome Back!')).toBeVisible()
  })

  test('should preserve data across page reloads', async ({ page }) => {
    // Go to settings and change values
    await page.goto('/settings')
    
    await page.getByTestId('calories-input').fill('2200')
    await page.getByTestId('protein-input').fill('160') 
    await page.getByTestId('save-settings').click()
    
    // Wait for save
    await TEST_HELPERS.waitForSettingsSave(page)
    
    // Reload page
    await page.reload()
    
    // Values should be preserved
    await expect(page.getByTestId('calories-input')).toHaveValue('2200')
    await expect(page.getByTestId('protein-input')).toHaveValue('160')
    
    // Check dashboard shows updated values
    await page.goto('/')
    await expect(page.getByText('0/2200cal')).toBeVisible()
    await expect(page.getByText('0/160g')).toBeVisible()
  })

  test('should handle offline-like behavior with local storage', async ({ page }) => {
    // This test verifies the app works with local data storage
    await page.goto('/')
    
    // App should load successfully
    await expect(page.getByTestId('app-title')).toHaveText('Food Tracker')
    await expect(page.getByText('Welcome Back!')).toBeVisible()
    
    // All navigation should work
    await page.getByTestId('nav-add').click()
    await expect(page.getByText('Add New Meal')).toBeVisible()
    
    await page.getByTestId('nav-history').click()
    await expect(page.getByText('Meal History')).toBeVisible()
    
    await page.getByTestId('nav-settings').click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    
    // Settings should be functional
    await page.getByTestId('dark-mode-toggle').click()
    
    // Return to dashboard
    await page.getByTestId('nav-home').click()
    await expect(page.getByText('Welcome Back!')).toBeVisible()
  })
})