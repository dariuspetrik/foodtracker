import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const Dashboard: React.FC = () => {
  console.log('Dashboard: Component rendering...')
  const { state, getTodaysNutrition } = useApp()
  console.log('Dashboard: State received:', { 
    hasState: !!state, 
    isLoading: state?.isLoading,
    settingsLoaded: !!state?.settings,
    mealsCount: state?.meals?.length || 0
  })
  
  // Add comprehensive safety checks
  if (!state) {
    console.warn('Dashboard: No state available')
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing app...</p>
        </div>
      </div>
    )
  }

  if (state.isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!state.settings) {
    console.warn('Dashboard: Settings not available')
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Settings unavailable</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Get today's nutrition with additional safety
  const todaysNutrition = (() => {
    try {
      const nutrition = getTodaysNutrition()
      return nutrition && typeof nutrition === 'object' ? nutrition : { calories: 0, protein: 0, carbs: 0, fat: 0 }
    } catch (error) {
      console.error('Dashboard: Error getting today\'s nutrition:', error)
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
  })()

  const progressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const MacroCard: React.FC<{
    label: string
    current: number
    target: number
    unit: string
    color: string
  }> = ({ label, current, target, unit, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {Math.round(current)}/{target}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${progressPercentage(current, target)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        {Math.round(target - current)} {unit} remaining
      </p>
    </div>
  )

  // Get today's meals with comprehensive filtering
  const todaysMeals = (() => {
    try {
      if (!state.meals || !Array.isArray(state.meals)) return []
      
      const today = new Date().toDateString()
      return state.meals.filter(meal => {
        if (!meal || typeof meal !== 'object' || !meal.timestamp) return false
        try {
          return new Date(meal.timestamp).toDateString() === today
        } catch (error) {
          console.warn('Dashboard: Invalid meal timestamp:', meal.timestamp, error)
          return false
        }
      })
    } catch (error) {
      console.error('Dashboard: Error filtering today\'s meals:', error)
      return []
    }
  })()

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your nutrition with AI-powered food recognition
        </p>
      </div>

      {/* Quick Add Button */}
      <Link
        to="/add"
        className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-lg text-center transition-colors"
        data-testid="quick-add-meal"
      >
        📷 Add New Meal
      </Link>

      {/* Daily Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Progress
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <MacroCard
            label="Calories"
            current={todaysNutrition.calories}
            target={state.settings.dailyCalories}
            unit="cal"
            color="bg-blue-500"
          />
          <MacroCard
            label="Protein"
            current={todaysNutrition.protein}
            target={state.settings.dailyProtein}
            unit="g"
            color="bg-green-500"
          />
          <MacroCard
            label="Carbs"
            current={todaysNutrition.carbs}
            target={state.settings.dailyCarbs}
            unit="g"
            color="bg-yellow-500"
          />
          <MacroCard
            label="Fat"
            current={todaysNutrition.fat}
            target={state.settings.dailyFat}
            unit="g"
            color="bg-red-500"
          />
        </div>
      </div>

      {/* Recent Meals */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Meals ({todaysMeals.length})
          </h3>
          <Link
            to="/history"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {todaysMeals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No meals logged today yet
            </p>
            <Link
              to="/add"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Your First Meal
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysMeals.slice(0, 3).map((meal) => {
              // Additional safety check for each meal
              if (!meal || !meal.id) return null
              
              return (
                <div
                  key={meal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                  data-testid={`meal-${meal.id}`}
                >
                  <div className="flex items-center space-x-3">
                    {meal.photo && (
                      <img
                        src={meal.photo}
                        alt="Meal"
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          console.warn('Failed to load meal image:', meal.id)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Array.isArray(meal.ingredients) && meal.ingredients.length > 0
                          ? meal.ingredients.map(ing => ing?.name || 'Unknown').filter(name => name !== 'Unknown').join(', ') || 'No ingredients'
                          : 'No ingredients'
                        }
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(meal.nutrition?.calories || 0)} cal • {Math.round(meal.totalWeight || 0)}g
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {(() => {
                          try {
                            return new Date(meal.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          } catch {
                            return 'Unknown time'
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        )}
      </div>

      {/* PWA Install Hint */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">📱</span>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Install as App
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Add to your home screen for quick access and offline use. 
              Tap Share → Add to Home Screen in Safari.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard