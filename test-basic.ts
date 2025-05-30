// Basic TypeScript test to check for undefined issues
import { Meal, UserSettings, NutritionData } from './src/types'

// Test type definitions
const testMeal: Meal = {
  id: 'test-123',
  timestamp: Date.now(),
  totalWeight: 200,
  ingredients: [],
  nutrition: {
    calories: 100,
    protein: 10,
    carbs: 20,
    fat: 5
  }
}

const testSettings: UserSettings = {
  dailyCalories: 2000,
  dailyProtein: 150,
  dailyCarbs: 250,
  dailyFat: 70,
  units: 'metric',
  darkMode: false
}

const testNutrition: NutritionData = {
  calories: 100,
  protein: 10,
  carbs: 20,
  fat: 5
}

console.log('Types test passed:', {
  meal: !!testMeal,
  settings: !!testSettings,
  nutrition: !!testNutrition
})

// Test basic functions
const safeGet = <T>(obj: T | undefined | null, fallback: T): T => {
  return obj ?? fallback
}

const testUndefined = undefined
const testNull = null
const testEmpty = {}

console.log('Safety tests:', {
  undefined: safeGet(testUndefined, 'fallback'),
  null: safeGet(testNull, 'fallback'),  
  empty: safeGet(testEmpty, 'fallback')
})

export { testMeal, testSettings, testNutrition }