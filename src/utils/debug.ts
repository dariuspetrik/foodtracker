// Debug utilities for identifying issues
export const debugLog = (context: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG:${context}]`, {
      timestamp: new Date().toISOString(),
      data: typeof data === 'object' ? { ...data } : data,
      type: typeof data,
      isArray: Array.isArray(data),
      isNull: data === null,
      isUndefined: data === undefined
    })
  }
}

export const debugError = (context: string, error: any) => {
  console.error(`[ERROR:${context}]`, {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    type: typeof error
  })
}

export const debugState = (stateName: string, state: any) => {
  if (process.env.NODE_ENV === 'development') {
    debugLog(stateName, {
      hasState: !!state,
      stateKeys: state && typeof state === 'object' ? Object.keys(state) : 'not an object',
      stateType: typeof state
    })
  }
}

export const checkAppHealth = () => {
  const health = {
    timestamp: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      indexedDB: 'indexedDB' in window,
      fetch: 'fetch' in window,
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window
    },
    document: {
      readyState: document.readyState,
      rootElement: !!document.getElementById('root')
    },
    window: {
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    }
  }
  
  console.log('[APP_HEALTH]', health)
  return health
}