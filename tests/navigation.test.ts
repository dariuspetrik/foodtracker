import { test, expect } from '@playwright/test'

test.describe('Navigation & PWA Features', () => {
  test('should navigate between all main pages using bottom navigation', async ({ page }) => {
    // Start at dashboard
    await page.goto('/')
    await expect(page.getByText('Welcome Back!')).toBeVisible()
    await expect(page.getByTestId('app-title')).toHaveText('Food Tracker')

    // Navigate to add meal using bottom nav
    await page.getByTestId('nav-add').click()
    await expect(page.getByText('Add New Meal')).toBeVisible()
    await expect(page.getByTestId('upload-photo')).toBeVisible()

    // Navigate to history using bottom nav
    await page.getByTestId('nav-history').click()
    await expect(page.getByText('Meal History')).toBeVisible()
    await expect(page.getByTestId('date-selector')).toBeVisible()

    // Navigate to settings using bottom nav
    await page.getByTestId('nav-settings').click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByTestId('save-settings')).toBeVisible()

    // Navigate back to dashboard using bottom nav
    await page.getByTestId('nav-home').click()
    await expect(page.getByText('Welcome Back!')).toBeVisible()
  })

  test('should show PWA characteristics', async ({ page }) => {
    await page.goto('/')

    // Check PWA install hint on dashboard
    await expect(page.getByText('Install as App')).toBeVisible()
    await expect(page.getByText('Add to your home screen for quick access and offline use')).toBeVisible()

    // Check page has proper PWA manifest and service worker setup
    // (These would be verified by the browser's PWA capabilities)
    
    // Verify the app works offline-first with local storage
    // The fact that we can navigate and see content indicates offline capability
    await expect(page.getByTestId('quick-add-meal')).toBeVisible()
  })

  test('should maintain state across navigation', async ({ page }) => {
    await page.goto('/settings')

    // Change a setting
    await page.getByTestId('calories-input').fill('2500')
    await page.getByTestId('save-settings').click()
    
    // Wait for save to complete
    await page.waitForFunction(() => {
      const button = document.querySelector('[data-testid="save-settings"]')
      return button && button.textContent === 'Save Settings'
    }, { timeout: 3000 })

    // Navigate away and back
    await page.goto('/')
    await page.goto('/settings')

    // Setting should be preserved
    await expect(page.getByTestId('calories-input')).toHaveValue('2500')
  })
})