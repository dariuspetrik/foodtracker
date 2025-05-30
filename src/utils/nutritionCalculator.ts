import { Ingredient, NutritionData, NutritionDatabase } from '../types'

let nutritionDatabase: NutritionDatabase | null = null

export const loadNutritionDatabase = async (): Promise<NutritionDatabase> => {
  if (nutritionDatabase) return nutritionDatabase

  try {
    console.log('Loading nutrition database...')
    const response = await fetch('/nutrition.json')
    if (!response.ok) {
      throw new Error(`Failed to load nutrition database: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid nutrition database format')
    }
    
    nutritionDatabase = data
    console.log('Nutrition database loaded successfully:', Object.keys(nutritionDatabase).length, 'foods')
    return nutritionDatabase
  } catch (error) {
    console.error('Failed to load nutrition database:', error)
    
    // Return a minimal fallback database to prevent app crash
    const fallbackDatabase: NutritionDatabase = {
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }
    }
    
    nutritionDatabase = fallbackDatabase
    console.warn('Using fallback nutrition database')
    return nutritionDatabase
  }
}

export const calculateIngredientNutrition = (
  foodName: string,
  weightInGrams: number,
  database: NutritionDatabase
): NutritionData => {
  if (!foodName || !database || typeof weightInGrams !== 'number' || weightInGrams <= 0) {
    console.warn('Invalid parameters for nutrition calculation:', { foodName, weightInGrams, database: !!database })
    return { calories: 0, protein: 0, carbs: 0, fat: 0 }
  }

  const baseNutrition = database[foodName.toLowerCase()]
  
  if (!baseNutrition) {
    console.warn(`Nutrition data not found for: ${foodName}`)
    // Return fallback nutrition data instead of throwing
    return { calories: 100, protein: 5, carbs: 10, fat: 3 } // Generic food fallback
  }

  // Nutrition data is per 100g, so calculate for actual weight
  const factor = weightInGrams / 100

  return {
    calories: Math.round((baseNutrition.calories || 0) * factor),
    protein: Math.round((baseNutrition.protein || 0) * factor * 10) / 10,
    carbs: Math.round((baseNutrition.carbs || 0) * factor * 10) / 10,
    fat: Math.round((baseNutrition.fat || 0) * factor * 10) / 10
  }
}

export const calculateMealNutrition = (ingredients: Ingredient[]): NutritionData => {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 }
  }

  return ingredients.reduce(
    (total, ingredient) => {
      if (!ingredient || !ingredient.nutrition) {
        console.warn('Invalid ingredient in meal calculation:', ingredient)
        return total
      }
      
      const nutrition = ingredient.nutrition
      return {
        calories: total.calories + (nutrition.calories || 0),
        protein: Math.round((total.protein + (nutrition.protein || 0)) * 10) / 10,
        carbs: Math.round((total.carbs + (nutrition.carbs || 0)) * 10) / 10,
        fat: Math.round((total.fat + (nutrition.fat || 0)) * 10) / 10
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export const createIngredientsFromPredictions = async (
  predictions: { className: string; probability: number }[],
  totalWeight: number
): Promise<Ingredient[]> => {
  try {
    if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
      console.warn('No valid predictions provided')
      return []
    }

    if (!totalWeight || totalWeight <= 0) {
      console.warn('Invalid total weight:', totalWeight)
      return []
    }

    const database = await loadNutritionDatabase()
    if (!database) {
      console.error('Failed to load nutrition database')
      return []
    }
    
    // Filter predictions that exist in our nutrition database
    const validPredictions = predictions.filter(pred => {
      if (!pred || !pred.className) return false
      const exists = database[pred.className.toLowerCase()]
      return exists
    })

    // If no valid predictions, return empty array
    if (validPredictions.length === 0) {
      console.warn('No valid predictions found in database')
      return []
    }

    // Create ingredients with equal distribution
    const equalPercentage = 100 / validPredictions.length

    return validPredictions.map((pred, index) => {
      const weight = (totalWeight * equalPercentage) / 100
      return {
        id: (index + 1).toString(),
        name: pred.className,
        percentage: Math.round(equalPercentage * 10) / 10,
        weight: Math.round(weight),
        nutrition: calculateIngredientNutrition(pred.className, weight, database)
      }
    })
  } catch (error) {
    console.error('Error creating ingredients from predictions:', error)
    return []
  }
}

export const updateIngredientPercentages = async (
  ingredients: Ingredient[],
  totalWeight: number
): Promise<Ingredient[]> => {
  const database = await loadNutritionDatabase()

  return ingredients.map(ingredient => {
    const weight = (totalWeight * ingredient.percentage) / 100
    return {
      ...ingredient,
      weight: Math.round(weight),
      nutrition: calculateIngredientNutrition(ingredient.name, weight, database)
    }
  })
}

export const validatePercentages = (ingredients: Ingredient[]): boolean => {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return false
  }

  const total = ingredients.reduce((sum, ing) => {
    if (!ing || typeof ing.percentage !== 'number') {
      return sum
    }
    return sum + ing.percentage
  }, 0)
  
  return Math.abs(total - 100) < 0.1 // Allow for small rounding errors
}