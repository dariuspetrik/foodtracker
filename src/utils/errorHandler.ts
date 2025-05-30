// Centralized error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleError = (error: unknown, context?: string): AppError => {
  console.error(`Error in ${context || 'unknown context'}:`, error)
  
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'RUNTIME_ERROR', { originalError: error.name })
  }
  
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', { context })
}

export const safeAsyncCall = async <T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  context?: string
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    handleError(error, context)
    return fallbackValue
  }
}

export const safeCall = <T>(
  fn: () => T,
  fallbackValue: T,
  context?: string
): T => {
  try {
    return fn()
  } catch (error) {
    handleError(error, context)
    return fallbackValue
  }
}

// Validation utilities
export const validateMeal = (meal: any): boolean => {
  return Boolean(
    meal &&
    typeof meal === 'object' &&
    meal.id &&
    typeof meal.timestamp === 'number' &&
    Array.isArray(meal.ingredients) &&
    meal.nutrition &&
    typeof meal.nutrition === 'object'
  )
}

export const validateIngredient = (ingredient: any): boolean => {
  return Boolean(
    ingredient &&
    typeof ingredient === 'object' &&
    ingredient.id &&
    ingredient.name &&
    typeof ingredient.percentage === 'number' &&
    typeof ingredient.weight === 'number' &&
    ingredient.nutrition &&
    typeof ingredient.nutrition === 'object'
  )
}

export const validateSettings = (settings: any): boolean => {
  return Boolean(
    settings &&
    typeof settings === 'object' &&
    typeof settings.dailyCalories === 'number' &&
    typeof settings.dailyProtein === 'number' &&
    typeof settings.dailyCarbs === 'number' &&
    typeof settings.dailyFat === 'number' &&
    (settings.units === 'metric' || settings.units === 'imperial') &&
    typeof settings.darkMode === 'boolean'
  )
}