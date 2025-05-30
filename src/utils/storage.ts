import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Meal, UserSettings } from '../types'
import { handleError, validateMeal, validateSettings } from './errorHandler'

interface FoodTrackerDB extends DBSchema {
  meals: {
    key: string
    value: Meal
  }
  settings: {
    key: string
    value: UserSettings
  }
}

let db: IDBPDatabase<FoodTrackerDB> | null = null

export const initDB = async (): Promise<IDBPDatabase<FoodTrackerDB>> => {
  if (db) return db

  try {
    db = await openDB<FoodTrackerDB>('FoodTrackerDB', 1, {
      upgrade(database) {
        console.log('Upgrading database...')
        
        // Create meals store
        if (!database.objectStoreNames.contains('meals')) {
          const mealsStore = database.createObjectStore('meals', { keyPath: 'id' })
          mealsStore.createIndex('timestamp', 'timestamp')
          console.log('Created meals store')
        }

        // Create settings store
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'key' })
          console.log('Created settings store')
        }
      },
      blocked() {
        console.warn('Database upgrade blocked')
      },
      blocking() {
        console.warn('Database blocking upgrade')
      },
      terminated() {
        console.warn('Database connection terminated')
        db = null
      }
    })
    
    console.log('Database initialized successfully')
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    db = null
    throw error
  }
}

export const saveMeal = async (meal: Meal): Promise<void> => {
  try {
    if (!validateMeal(meal)) {
      throw new Error('Invalid meal data structure')
    }

    const database = await initDB()
    if (!database) {
      throw new Error('Database not available')
    }
    
    await database.put('meals', meal)
    console.log('Meal saved successfully:', meal.id)
  } catch (error) {
    const appError = handleError(error, 'saveMeal')
    throw appError
  }
}

export const loadMeals = async (): Promise<Meal[]> => {
  try {
    const database = await initDB()
    if (!database) {
      console.warn('Database not available for loading meals')
      return []
    }
    
    const meals = await database.getAll('meals')
    console.log('Loaded meals from database:', meals.length)
    
    if (!Array.isArray(meals)) {
      console.warn('Invalid meals data from database')
      return []
    }
    
    // Filter out invalid meals and sort
    const validMeals = meals.filter(meal => validateMeal(meal))
    
    if (validMeals.length !== meals.length) {
      console.warn(`Filtered out ${meals.length - validMeals.length} invalid meals`)
    }
    
    return validMeals.sort((a, b) => {
      const aTime = a?.timestamp || 0
      const bTime = b?.timestamp || 0
      return bTime - aTime
    })
  } catch (error) {
    handleError(error, 'loadMeals')
    return []
  }
}

export const deleteMeal = async (id: string): Promise<void> => {
  const database = await initDB()
  await database.delete('meals', id)
}

export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    if (!validateSettings(settings)) {
      throw new Error('Invalid settings data structure')
    }

    const database = await initDB()
    if (!database) {
      throw new Error('Database not available')
    }
    
    await database.put('settings', { key: 'userSettings', ...settings })
    console.log('Settings saved successfully')
  } catch (error) {
    const appError = handleError(error, 'saveSettings')
    throw appError
  }
}

export const loadSettings = async (): Promise<UserSettings> => {
  const defaultSettings: UserSettings = {
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFat: 70,
    units: 'metric',
    darkMode: false
  }

  try {
    const database = await initDB()
    if (!database) {
      console.warn('Database not available, using default settings')
      return defaultSettings
    }

    const settings = await database.get('settings', 'userSettings')
    
    if (settings && typeof settings === 'object') {
      // Remove the 'key' property that was added for storage and validate
      const { key, ...userSettings } = settings as any
      
      // Validate required properties exist
      const validatedSettings: UserSettings = {
        dailyCalories: typeof userSettings.dailyCalories === 'number' ? userSettings.dailyCalories : defaultSettings.dailyCalories,
        dailyProtein: typeof userSettings.dailyProtein === 'number' ? userSettings.dailyProtein : defaultSettings.dailyProtein,
        dailyCarbs: typeof userSettings.dailyCarbs === 'number' ? userSettings.dailyCarbs : defaultSettings.dailyCarbs,
        dailyFat: typeof userSettings.dailyFat === 'number' ? userSettings.dailyFat : defaultSettings.dailyFat,
        units: userSettings.units === 'imperial' ? 'imperial' : 'metric',
        darkMode: typeof userSettings.darkMode === 'boolean' ? userSettings.darkMode : defaultSettings.darkMode
      }
      
      return validatedSettings
    }
    
    // Return default settings if none exist
    return defaultSettings
  } catch (error) {
    console.error('Failed to load settings:', error)
    return defaultSettings
  }
}

export const clearAllData = async (): Promise<void> => {
  const database = await initDB()
  await database.clear('meals')
  await database.clear('settings')
}