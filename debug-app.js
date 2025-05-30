// Debug script to identify undefined issues
console.log('=== Food Tracker Debug Check ===')

// Check if React is available
console.log('React available:', typeof React !== 'undefined' ? 'Yes' : 'No')

// Check if main app components can be imported
try {
  console.log('Checking main entry point...')
  
  // Check document.getElementById('root')
  const rootElement = document.getElementById('root')
  console.log('Root element found:', !!rootElement)
  
  if (rootElement) {
    console.log('Root element details:', {
      id: rootElement.id,
      tagName: rootElement.tagName,
      className: rootElement.className
    })
  }

  // Check if window is available
  console.log('Window available:', typeof window !== 'undefined')
  console.log('Navigator available:', typeof navigator !== 'undefined')
  
  // Check for localStorage
  console.log('LocalStorage available:', typeof localStorage !== 'undefined')
  
  // Check for IndexedDB
  console.log('IndexedDB available:', typeof indexedDB !== 'undefined')
  
  // Check for fetch
  console.log('Fetch available:', typeof fetch !== 'undefined')
  
  console.log('=== Environment Check Complete ===')
  
} catch (error) {
  console.error('Debug check failed:', error)
}