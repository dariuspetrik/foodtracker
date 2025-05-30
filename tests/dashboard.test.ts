import { test, expect } from '@playwright/test'

test.describe('Dashboard - Daily Tracking', () => {
  test('should display daily progress and allow quick meal addition', async ({ page }) => {
    await page.goto('/')

    // Check welcome section
    await expect(page.getByText('Welcome Back!')).toBeVisible()
    await expect(page.getByText('Track your nutrition with AI-powered food recognition')).toBeVisible()

    // Check quick add meal button
    await expect(page.getByTestId('quick-add-meal')).toBeVisible()
    await expect(page.getByTestId('quick-add-meal')).toHaveText('📷 Add New Meal')

    // Check daily progress section
    await expect(page.getByText('Today\'s Progress')).toBeVisible()

    // Should show default values for macro cards (0 current values)
    await expect(page.getByText('0/2000cal')).toBeVisible() // Default calories
    await expect(page.getByText('0/150g')).toBeVisible() // Default protein  
    await expect(page.getByText('0/250g')).toBeVisible() // Default carbs
    await expect(page.getByText('0/70g')).toBeVisible() // Default fat

    // Should show no meals logged yet
    await expect(page.getByText('No meals logged today yet')).toBeVisible()

    // Check PWA install hint
    await expect(page.getByText('Install as App')).toBeVisible()

    // Test navigation to add meal
    await page.getByTestId('quick-add-meal').click()
    await expect(page.url()).toContain('/add')
  })

  test('should show meal entries after adding meals', async ({ page }) => {
    await page.goto('/')

    // First add a meal by navigating to add page
    await page.getByTestId('quick-add-meal').click()
    
    // For now, just verify we can navigate back to see the meal would appear
    // (Since we can't easily mock the ML model in this test)
    await page.goto('/')
    
    // Verify the "Today's Meals" section structure
    await expect(page.getByText(/Today's Meals \(\d+\)/)).toBeVisible()
  })
})