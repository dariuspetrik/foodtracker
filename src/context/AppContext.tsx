import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { loadMeals, loadSettings, saveMeal, saveSettings } from '../utils/storage'
import { Meal, NutritionData, UserSettings } from '../types'
import { handleError, validateMeal, validateSettings } from '../utils/errorHandler'
import { debugLog, debugError, debugState } from '../utils/debug'

interface AppState {
  meals: Meal[]
  settings: UserSettings
  isLoading: boolean
  darkMode: boolean
}

type AppAction =
  | { type: 'SET_MEALS'; payload: Meal[] }
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'UPDATE_MEAL'; payload: Meal }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }

const initialState: AppState = {
  meals: [],
  settings: {
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFat: 70,
    units: 'metric',
    darkMode: false
  },
  isLoading: true,
  darkMode: false
}

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_MEALS':
      return { ...state, meals: action.payload }
    case 'ADD_MEAL':
      return { ...state, meals: [action.payload, ...state.meals] }
    case 'DELETE_MEAL':
      return { ...state, meals: state.meals.filter(meal => meal.id !== action.payload) }
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(meal => 
          meal.id === action.payload.id ? action.payload : meal
        )
      }
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload, darkMode: action.payload.darkMode }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'TOGGLE_DARK_MODE':
      const newDarkMode = !state.darkMode
      const newSettings = { ...state.settings, darkMode: newDarkMode }
      saveSettings(newSettings)
      return { ...state, darkMode: newDarkMode, settings: newSettings }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  addMeal: (meal: Meal) => void
  deleteMeal: (id: string) => void
  updateMeal: (meal: Meal) => void
  updateSettings: (settings: UserSettings) => void
  toggleDarkMode: () => void
  getTodaysNutrition: () => NutritionData
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    debugLog('AppContext:init', 'Starting initialization')
    
    const loadData = async () => {
      try {
        // Set loading state immediately
        debugLog('AppContext:init', 'Setting loading state')
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // Initialize with defaults first to prevent undefined states
        debugLog('AppContext:init', 'Setting default values')
        dispatch({ type: 'SET_MEALS', payload: [] })
        dispatch({ type: 'SET_SETTINGS', payload: initialState.settings })
        
        // Load data with a reasonable timeout
        debugLog('AppContext:init', 'Starting data load')
        const loadPromise = Promise.all([
          loadMeals().catch((error) => {
            debugError('AppContext:loadMeals', error)
            return []
          }),
          loadSettings().catch((error) => {
            debugError('AppContext:loadSettings', error)
            return initialState.settings
          })
        ])
        
        const timeoutPromise = new Promise<[Meal[], UserSettings]>((resolve) => 
          setTimeout(() => {
            debugLog('AppContext:init', 'Data loading timed out, using defaults')
            resolve([[], initialState.settings])
          }, 3000)
        )
        
        const [meals, settings] = await Promise.race([loadPromise, timeoutPromise])
        
        debugLog('AppContext:rawData', { meals, settings })
        
        // Ensure we have valid data with comprehensive validation
        const validMeals = Array.isArray(meals) ? meals.filter(meal => validateMeal(meal)) : []
        debugLog('AppContext:validMeals', validMeals)
        
        const validSettings = validateSettings(settings) ? settings : {
          ...initialState.settings,
          ...(settings && typeof settings === 'object' ? {
            dailyCalories: typeof settings.dailyCalories === 'number' ? settings.dailyCalories : initialState.settings.dailyCalories,
            dailyProtein: typeof settings.dailyProtein === 'number' ? settings.dailyProtein : initialState.settings.dailyProtein,
            dailyCarbs: typeof settings.dailyCarbs === 'number' ? settings.dailyCarbs : initialState.settings.dailyCarbs,
            dailyFat: typeof settings.dailyFat === 'number' ? settings.dailyFat : initialState.settings.dailyFat,
            units: settings.units === 'imperial' ? 'imperial' : 'metric',
            darkMode: typeof settings.darkMode === 'boolean' ? settings.darkMode : initialState.settings.darkMode
          } : {})
        }
        debugLog('AppContext:validSettings', validSettings)
        
        dispatch({ type: 'SET_MEALS', payload: validMeals })
        dispatch({ type: 'SET_SETTINGS', payload: validSettings })
        
        debugLog('AppContext:success', {
          mealsCount: validMeals.length,
          settingsValid: !!validSettings
        })
        
      } catch (error) {
        debugError('AppContext:loadData', error)
        
        dispatch({ type: 'SET_MEALS', payload: [] })
        dispatch({ type: 'SET_SETTINGS', payload: initialState.settings })
      } finally {
        // Always stop loading after a reasonable time
        setTimeout(() => {
          debugLog('AppContext:init', 'Stopping loading')
          dispatch({ type: 'SET_LOADING', payload: false })
        }, 100)
      }
    }

    loadData()
  }, [])

  const addMeal = async (meal: Meal) => {
    try {
      if (!validateMeal(meal)) {
        throw new Error('Invalid meal data')
      }
      await saveMeal(meal)
      dispatch({ type: 'ADD_MEAL', payload: meal })
    } catch (error) {
      const appError = handleError(error, 'addMeal')
      console.error('Failed to save meal:', appError.message)
      throw appError
    }
  }

  const deleteMeal = async (id: string) => {
    // Implementation would remove from IndexedDB
    dispatch({ type: 'DELETE_MEAL', payload: id })
  }

  const updateMeal = async (meal: Meal) => {
    try {
      await saveMeal(meal)
      dispatch({ type: 'UPDATE_MEAL', payload: meal })
    } catch (error) {
      console.error('Failed to update meal:', error)
    }
  }

  const updateSettings = async (settings: UserSettings) => {
    try {
      if (!validateSettings(settings)) {
        throw new Error('Invalid settings data')
      }
      await saveSettings(settings)
      dispatch({ type: 'SET_SETTINGS', payload: settings })
    } catch (error) {
      const appError = handleError(error, 'updateSettings')
      console.error('Failed to save settings:', appError.message)
      throw appError
    }
  }

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' })
  }

  const getTodaysNutrition = (): NutritionData => {
    try {
      // Return defaults if state is not ready
      if (!state || !state.meals || !Array.isArray(state.meals)) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 }
      }

      const today = new Date().toDateString()
      const todaysMeals = state.meals.filter(meal => {
        if (!meal || typeof meal !== 'object' || !meal.timestamp) return false
        try {
          return new Date(meal.timestamp).toDateString() === today
        } catch {
          return false
        }
      })

      return todaysMeals.reduce(
        (total, meal) => {
          if (!meal || !meal.nutrition || typeof meal.nutrition !== 'object') return total
          return {
            calories: total.calories + (Number(meal.nutrition.calories) || 0),
            protein: total.protein + (Number(meal.nutrition.protein) || 0),
            carbs: total.carbs + (Number(meal.nutrition.carbs) || 0),
            fat: total.fat + (Number(meal.nutrition.fat) || 0)
          }
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
    } catch (error) {
      console.error('Error calculating today\'s nutrition:', error)
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
  }

  const value: AppContextType = {
    state,
    addMeal,
    deleteMeal,
    updateMeal,
    updateSettings,
    toggleDarkMode,
    getTodaysNutrition
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  
  debugState('useApp:context', context)
  
  if (!context) {
    debugError('useApp', 'called outside of AppProvider')
    throw new Error('useApp must be used within an AppProvider')
  }
  
  // Add additional validation
  if (!context.state) {
    debugError('useApp', 'Context state is undefined')
  }
  
  debugState('useApp:state', context.state)
  
  return context
}

// Error Boundary Component
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The app encountered an error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}