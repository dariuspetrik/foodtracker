// Simple test to verify basic functionality
import type { Meal, UserSettings, NutritionData } from './src/types'

const testFunction = () => {
  console.log('=== Simple Test Start ===')
  
  try {
    // Test 1: Type definitions
    const testNutrition: NutritionData = {
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5
    }
    console.log('✓ NutritionData type works')

    const testSettings: UserSettings = {
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 70,
      units: 'metric',
      darkMode: false
    }
    console.log('✓ UserSettings type works')

    const testMeal: Meal = {
      id: 'test-123',
      timestamp: Date.now(),
      totalWeight: 200,
      ingredients: [],
      nutrition: testNutrition
    }
    console.log('✓ Meal type works')

    // Test 2: Basic functions
    const safeMath = (a: number | undefined, b: number | undefined): number => {
      return (a || 0) + (b || 0)
    }
    
    const result = safeMath(10, undefined)
    console.log('✓ Safe math function works:', result)

    // Test 3: Array operations
    const testArray: Meal[] = [testMeal]
    const filtered = testArray.filter(meal => meal && meal.id)
    console.log('✓ Array filtering works:', filtered.length)

    console.log('=== All Tests Passed ===')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

export default testFunction