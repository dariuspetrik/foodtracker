import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Meal } from '../types'

const History: React.FC = () => {
  const { state, deleteMeal } = useApp()
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)

  // Group meals by date with safety checks
  const mealsByDate = (state?.meals || []).reduce((groups, meal) => {
    if (!meal || !meal.timestamp) return groups
    
    try {
      const date = new Date(meal.timestamp).toISOString().split('T')[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(meal)
    } catch (error) {
      console.warn('Invalid meal timestamp:', meal)
    }
    return groups
  }, {} as Record<string, Meal[]>)

  const selectedMeals = mealsByDate[selectedDate] || []

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (dateString === today) return 'Today'
      if (dateString === yesterday) return 'Yesterday'
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  const getDayNutrition = (meals: Meal[]) => {
    if (!meals || !Array.isArray(meals)) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    
    return meals.reduce(
      (total, meal) => {
        if (!meal || !meal.nutrition) return total
        return {
          calories: total.calories + (meal.nutrition.calories || 0),
          protein: total.protein + (meal.nutrition.protein || 0),
          carbs: total.carbs + (meal.nutrition.carbs || 0),
          fat: total.fat + (meal.nutrition.fat || 0)
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      await deleteMeal(mealId)
      if (selectedMeal?.id === mealId) {
        setSelectedMeal(null)
      }
    }
  }

  // Get available dates (last 30 days)
  const availableDates = Object.keys(mealsByDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 30)

  if (selectedMeal) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedMeal(null)}
            className="text-blue-500 hover:text-blue-600"
            data-testid="back-to-history"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold">Meal Details</h2>
        </div>

        <div className="space-y-4">
          {selectedMeal.photo && (
            <div className="flex justify-center">
              <img
                src={selectedMeal.photo}
                alt="Meal"
                className="w-64 h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {(selectedMeal.ingredients || []).map(ing => ing?.name || 'Unknown').join(', ')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(selectedMeal.timestamp).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total weight: {selectedMeal.totalWeight || 0}g
                </p>
              </div>
              <button
                onClick={() => handleDeleteMeal(selectedMeal.id)}
                className="text-red-500 hover:text-red-700 text-sm"
                data-testid="delete-meal"
              >
                Delete
              </button>
            </div>

            {/* Nutrition Summary */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-500">
                  {selectedMeal.nutrition?.calories || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">
                  {selectedMeal.nutrition?.protein || 0}g
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-500">
                  {selectedMeal.nutrition?.carbs || 0}g
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-500">
                  {selectedMeal.nutrition?.fat || 0}g
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Fat</div>
              </div>
            </div>

            {/* Ingredients Breakdown */}
            <div>
              <h4 className="font-medium mb-2">Ingredients Breakdown</h4>
              <div className="space-y-2">
                {(selectedMeal.ingredients || []).map((ingredient) => (
                  <div
                    key={ingredient?.id || Math.random()}
                    className="bg-gray-50 dark:bg-gray-700 rounded p-3"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium capitalize">{ingredient?.name || 'Unknown'}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ingredient?.weight || 0}g ({(ingredient?.percentage || 0).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {ingredient?.nutrition?.calories || 0} cal • 
                      P: {ingredient?.nutrition?.protein || 0}g • 
                      C: {ingredient?.nutrition?.carbs || 0}g • 
                      F: {ingredient?.nutrition?.fat || 0}g
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Meal History</h2>
        <p className="text-gray-600 dark:text-gray-400">
          View your past meals and nutrition
        </p>
      </div>

      {/* Date Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Select Date</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          data-testid="date-selector"
        >
          {availableDates.map(date => (
            <option key={date} value={date}>
              {formatDate(date)} ({(mealsByDate[date] || []).length} meals)
            </option>
          ))}
        </select>
      </div>

      {selectedMeals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No meals logged for {formatDate(selectedDate)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Daily Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-3">
              Daily Summary - {formatDate(selectedDate)}
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {(() => {
                const dayNutrition = getDayNutrition(selectedMeals)
                return (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-500">
                        {Math.round(dayNutrition.calories)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">
                        {Math.round(dayNutrition.protein * 10) / 10}g
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-500">
                        {Math.round(dayNutrition.carbs * 10) / 10}g
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-500">
                        {Math.round(dayNutrition.fat * 10) / 10}g
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Fat</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Meals List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Meals ({selectedMeals.length})</h3>
            {selectedMeals.map((meal) => (
              <div
                key={meal?.id || Math.random()}
                onClick={() => setSelectedMeal(meal)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                data-testid={`history-meal-${meal?.id || 'unknown'}`}
              >
                <div className="flex items-center space-x-3">
                  {meal?.photo && (
                    <img
                      src={meal.photo}
                      alt="Meal"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {(meal?.ingredients || []).map(ing => ing?.name || 'Unknown').join(', ')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {meal?.nutrition?.calories || 0} cal • {meal?.totalWeight || 0}g
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {meal?.timestamp ? new Date(meal.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Unknown time'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      P: {meal?.nutrition?.protein || 0}g
                    </div>
                    <div className="text-sm font-medium">
                      C: {meal?.nutrition?.carbs || 0}g
                    </div>
                    <div className="text-sm font-medium">
                      F: {meal?.nutrition?.fat || 0}g
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(state?.meals || []).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No meals logged yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start tracking your nutrition by adding your first meal!
          </p>
        </div>
      )}
    </div>
  )
}

export default History