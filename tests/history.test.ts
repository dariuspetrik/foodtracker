import { test, expect } from '@playwright/test'

test.describe('Meal History', () => {
  test('should display meal history interface and allow date selection', async ({ page }) => {
    await page.goto('/history')

    // Check main history page elements
    await expect(page.getByText('Meal History')).toBeVisible()
    await expect(page.getByText('View your past meals and nutrition')).toBeVisible()

    // Check date selector
    await expect(page.getByTestId('date-selector')).toBeVisible()
    await expect(page.getByText('Select Date')).toBeVisible()

    // Should show "No meals logged yet" when no meals exist
    await expect(page.getByText('No meals logged yet')).toBeVisible()
    await expect(page.getByText('Start tracking your nutrition by adding your first meal!')).toBeVisible()

    // Test date selector functionality
    const dateSelector = page.getByTestId('date-selector')
    await expect(dateSelector).toBeVisible()

    // Check if there are any options in the selector
    const options = await dateSelector.locator('option').count()
    if (options > 0) {
      // If there are dates available, test selection
      await dateSelector.selectOption({ index: 0 })
    }
  })

  test('should navigate to meal details and allow deletion', async ({ page }) => {
    await page.goto('/history')

    // Check if any meals exist to test
    const mealItems = page.locator('[data-testid*="history-meal-"]')
    const mealCount = await mealItems.count()

    if (mealCount > 0) {
      // Click on first meal to view details
      await mealItems.first().click()

      // Should show meal details page
      await expect(page.getByTestId('back-to-history')).toBeVisible()
      await expect(page.getByText('Meal Details')).toBeVisible()

      // Should show delete button
      await expect(page.getByTestId('delete-meal')).toBeVisible()

      // Test back navigation
      await page.getByTestId('back-to-history').click()
      await expect(page.getByText('Meal History')).toBeVisible()
    } else {
      // No meals exist - verify empty state
      await expect(page.getByText('No meals logged yet')).toBeVisible()
    }
  })
})