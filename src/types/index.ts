export interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Ingredient {
  id: string
  name: string
  percentage: number
  nutrition: NutritionData
  weight: number // calculated weight in grams
}

export interface Meal {
  id: string
  timestamp: number
  photo?: string // base64 encoded image
  totalWeight: number // in grams
  ingredients: Ingredient[]
  nutrition: NutritionData // total nutrition for the meal
  notes?: string
}

export interface UserSettings {
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
  units: 'metric' | 'imperial'
  darkMode: boolean
}

export interface MLPrediction {
  className: string
  probability: number
}

export interface NutritionDatabase {
  [key: string]: NutritionData
}