import { test, expect } from '@playwright/test'
import { TEST_HELPERS } from './test-config'

test.describe('Settings & Configuration', () => {
  test('should allow updating daily nutrition goals', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to Settings using navigation button
    await page.getByRole('button', { name: 'Settings' }).click()

    // Check main settings page elements - use heading instead of generic text
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByText('Customize your nutrition goals and preferences')).toBeVisible()

    // Check daily nutrition goals section
    await expect(page.getByText('Daily Nutrition Goals')).toBeVisible()

    // Test nutrition goal inputs
    const caloriesInput = page.getByTestId('calories-input')
    const proteinInput = page.getByTestId('protein-input')
    const carbsInput = page.getByTestId('carbs-input')
    const fatInput = page.getByTestId('fat-input')

    // Verify inputs are visible and have default values
    await expect(caloriesInput).toBeVisible()
    await expect(proteinInput).toBeVisible()
    await expect(carbsInput).toBeVisible()
    await expect(fatInput).toBeVisible()

    // Test updating values
    await caloriesInput.fill('2200')
    await proteinInput.fill('160')
    await carbsInput.fill('220')
    await fatInput.fill('70')

    // Check that values were updated
    await expect(caloriesInput).toHaveValue('2200')
    await expect(proteinInput).toHaveValue('160')
    await expect(carbsInput).toHaveValue('220')
    await expect(fatInput).toHaveValue('70')

    // Test save settings
    await page.getByTestId('save-settings').click()
    await expect(page.getByText('Saving...')).toBeVisible()

    // Wait for save to complete
    await TEST_HELPERS.waitForSettingsSave(page)

    // Navigate back to Dashboard to verify persistence
    await page.getByRole('button', { name: 'Dashboard' }).click()
    await expect(page.getByRole('heading', { name: 'Today\'s Progress' })).toBeVisible()

    // Verify the new calorie goal shows up (might be "0 / 2200")
    await expect(page.getByText('2200')).toBeVisible()
  })

  test('should toggle dark mode and change units', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to Settings using navigation button
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    // Test dark mode toggle
    const darkModeToggle = page.getByTestId('dark-mode-toggle')
    await expect(darkModeToggle).toBeVisible()

    // Check current theme state
    const htmlElement = page.locator('html')
    const initialClass = await htmlElement.getAttribute('class')

    // Toggle dark mode
    await darkModeToggle.click()
    await page.waitForTimeout(300) // Allow for theme transition

    // Verify dark mode was applied
    const newClass = await htmlElement.getAttribute('class')
    if (initialClass?.includes('dark')) {
      // Was dark, now should be light
      expect(newClass).not.toContain('dark')
    } else {
      // Was light, now should be dark
      expect(newClass).toContain('dark')
    }

    // Test units selection
    const unitsSelect = page.getByTestId('units-select')
    await expect(unitsSelect).toBeVisible()
    
    // Test changing units
    await unitsSelect.selectOption('imperial')
    await expect(unitsSelect).toHaveValue('imperial')

    await unitsSelect.selectOption('metric')
    await expect(unitsSelect).toHaveValue('metric')

    // Save changes
    await page.getByTestId('save-settings').click()
    await TEST_HELPERS.waitForSettingsSave(page)

    // Navigate away and back to verify settings persistence
    await page.getByRole('button', { name: 'Dashboard' }).click()
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    // Verify units are still set to metric
    await expect(unitsSelect).toHaveValue('metric')
  })

  test('should display app info and allow data clearing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to Settings using navigation button
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    // Check about section
    await expect(page.getByText('About')).toBeVisible()
    await expect(page.getByText('Food Tracker PWA')).toBeVisible()
    await expect(page.getByText('Version 1.0.0')).toBeVisible()
    await expect(page.getByText('100% offline • No data tracking • Privacy first')).toBeVisible()

    // Test App Status modal
    await page.getByTestId('show-app-status').click()
    await expect(page.getByRole('heading', { name: 'App Status' })).toBeVisible()

    // Close the modal
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('heading', { name: 'App Status' })).not.toBeVisible()

    // Check data management section
    await expect(page.getByText('Data Management')).toBeVisible()
    await expect(page.getByText(/\d+ meals logged/)).toBeVisible()

    // Test clear data functionality
    await page.getByTestId('clear-data-button').click()

    // Should show confirmation modal
    await expect(page.getByText('Clear All Data?')).toBeVisible()
    await expect(page.getByText('This will permanently delete all your meals')).toBeVisible()

    // Test cancel first
    await page.getByText('Cancel').click()
    await expect(page.getByText('Clear All Data?')).not.toBeVisible()

    // Test the confirmation flow (but cancel to not actually clear data)
    await page.getByTestId('clear-data-button').click()
    await expect(page.getByTestId('confirm-clear-data')).toBeVisible()
    
    // Cancel instead of confirming to preserve any test data
    await page.getByText('Cancel').click()
    await expect(page.getByText('Clear All Data?')).not.toBeVisible()
  })
})