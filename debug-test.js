const { chromium } = require('playwright');

(async () => {
  console.log('Starting debug test...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  // Listen to console logs
  page.on('console', msg => {
    console.log(`BROWSER LOG: ${msg.text()}`)
  })
  
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`)
  })
  
  try {
    console.log('Navigating to app...')
    await page.goto('http://localhost:4173')
    
    console.log('Waiting 10 seconds to see what happens...')
    await page.waitForTimeout(10000)
    
    console.log('Checking for elements...')
    const title = await page.locator('[data-testid="app-title"]').isVisible()
    console.log('App title visible:', title)
    
    const welcomeText = await page.locator('text=Welcome Back!').isVisible()
    console.log('Welcome text visible:', welcomeText)
    
    const loading = await page.locator('text=Loading...').isVisible()
    console.log('Loading indicator visible:', loading)
    
  } catch (error) {
    console.error('Test error:', error)
  } finally {
    await browser.close()
  }
})();