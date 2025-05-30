import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { classifyImage, loadModel } from '../utils/mlModel'
import { createIngredientsFromPredictions, updateIngredientPercentages, calculateMealNutrition, validatePercentages } from '../utils/nutritionCalculator'
import { Ingredient, Meal } from '../types'

const AddMeal: React.FC = () => {
  const navigate = useNavigate()
  const { addMeal } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [step, setStep] = useState<'photo' | 'weight' | 'ingredients' | 'review'>('photo')
  const [photo, setPhoto] = useState<string>('')
  const [totalWeight, setTotalWeight] = useState<number>(200)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isUsingCamera, setIsUsingCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      })
      setStream(mediaStream)
      setIsUsingCamera(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Camera access failed:', error)
      setError('Camera access denied. Please use file upload instead.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsUsingCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setPhoto(photoDataUrl)
    stopCamera()
    processImage(photoDataUrl)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const photoDataUrl = e.target?.result as string
      setPhoto(photoDataUrl)
      processImage(photoDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async (photoDataUrl: string) => {
    setIsProcessing(true)
    setIsModelLoading(true)
    setError('')

    try {
      if (!photoDataUrl || typeof photoDataUrl !== 'string') {
        throw new Error('Invalid photo data')
      }

      // Pre-load the model
      await loadModel()
      setIsModelLoading(false)

      // Create image element for classification
      const img = new Image()
      img.crossOrigin = 'anonymous' // Add CORS support
      
      // Set timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        setError('Image processing timed out. Please try again.')
        setIsProcessing(false)
      }, 30000) // 30 second timeout
      
      img.onload = async () => {
        clearTimeout(timeoutId)
        try {
          // Validate image loaded properly
          if (!img.complete || img.naturalWidth === 0) {
            throw new Error('Image failed to load properly')
          }

          const predictions = await classifyImage(img)
          console.log('Food predictions:', predictions)

          if (!predictions || predictions.length === 0) {
            setError('No food items detected. Please try a different photo.')
            setIsProcessing(false)
            return
          }

          // Create initial ingredients with equal distribution
          const initialIngredients = await createIngredientsFromPredictions(predictions, totalWeight)
          
          if (!initialIngredients || initialIngredients.length === 0) {
            setError('No recognized food items found. Please try a different photo or add ingredients manually.')
            setIsProcessing(false)
            return
          }
          
          setIngredients(initialIngredients)
          setStep('weight')
        } catch (error) {
          console.error('Image processing failed:', error)
          setError(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.')
        } finally {
          setIsProcessing(false)
        }
      }
      
      img.onerror = (error) => {
        clearTimeout(timeoutId)
        console.error('Image load error:', error)
        setError('Failed to load image. Please try a different image.')
        setIsProcessing(false)
      }
      
      img.src = photoDataUrl
    } catch (error) {
      console.error('Model loading failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to load AI model. Please check your internet connection.')
      setIsProcessing(false)
      setIsModelLoading(false)
    }
  }

  const handleWeightChange = async (newWeight: number) => {
    setTotalWeight(newWeight)
    if (ingredients.length > 0) {
      const updatedIngredients = await updateIngredientPercentages(ingredients, newWeight)
      setIngredients(updatedIngredients)
    }
  }

  const handlePercentageChange = async (ingredientId: string, newPercentage: number) => {
    const updatedIngredients = ingredients.map(ing =>
      ing.id === ingredientId ? { ...ing, percentage: newPercentage } : ing
    )
    
    setIngredients(await updateIngredientPercentages(updatedIngredients, totalWeight))
  }

  const removeIngredient = async (ingredientId: string) => {
    const filteredIngredients = ingredients.filter(ing => ing.id !== ingredientId)
    
    if (filteredIngredients.length === 0) {
      setIngredients([])
      return
    }

    // Redistribute percentages equally
    const equalPercentage = 100 / filteredIngredients.length
    const redistributedIngredients = filteredIngredients.map(ing => ({
      ...ing,
      percentage: equalPercentage
    }))

    setIngredients(await updateIngredientPercentages(redistributedIngredients, totalWeight))
  }

  const handleSaveMeal = async () => {
    try {
      if (!ingredients || ingredients.length === 0) {
        setError('Please add at least one ingredient')
        return
      }

      if (!validatePercentages(ingredients)) {
        setError('Ingredient percentages must add up to 100%')
        return
      }

      if (!totalWeight || totalWeight <= 0) {
        setError('Please enter a valid total weight')
        return
      }

      const nutrition = calculateMealNutrition(ingredients)
      if (!nutrition) {
        setError('Failed to calculate nutrition. Please try again.')
        return
      }

      const meal: Meal = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        photo: photo || undefined,
        totalWeight,
        ingredients,
        nutrition
      }

      await addMeal(meal)
      navigate('/')
    } catch (error) {
      console.error('Failed to save meal:', error)
      setError('Failed to save meal. Please try again.')
    }
  }

  const resetFlow = () => {
    setStep('photo')
    setPhoto('')
    setIngredients([])
    setError('')
    setIsProcessing(false)
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Photo Capture Step
  if (step === 'photo') {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Add New Meal</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Take a photo or upload an image of your meal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {isUsingCamera ? (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-preview mx-auto block"
              data-testid="camera-preview"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex space-x-4 justify-center">
              <button
                onClick={capturePhoto}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                data-testid="capture-photo"
              >
                📷 Capture
              </button>
              <button
                onClick={stopCamera}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium transition-colors"
              data-testid="start-camera"
            >
              📷 Use Camera
            </button>
            
            <div className="text-center text-gray-500 dark:text-gray-400">or</div>
            
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-lg font-medium transition-colors"
                data-testid="upload-photo"
              >
                📁 Upload Photo
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              {isModelLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading AI model...</p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Analyzing your meal...</p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Weight Input Step
  if (step === 'weight') {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Meal Weight</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the total weight of your meal
          </p>
        </div>

        {photo && (
          <div className="flex justify-center">
            <img
              src={photo}
              alt="Your meal"
              className="w-48 h-36 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Weight (grams)
            </label>
            <input
              type="number"
              value={totalWeight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              min="1"
              max="2000"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
              data-testid="weight-input"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Detected Ingredients:
            </h3>
            <div className="space-y-1">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="text-sm text-blue-700 dark:text-blue-300">
                  • {ingredient.name} ({ingredient.percentage.toFixed(1)}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={resetFlow}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setStep('ingredients')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            data-testid="proceed-to-ingredients"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  // Ingredients Adjustment Step
  if (step === 'ingredients') {
    const totalPercentage = ingredients.reduce((sum, ing) => sum + ing.percentage, 0)

    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Adjust Ingredients</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fine-tune the ingredient percentages
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total: {totalWeight}g</span>
            <span className={`font-medium ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
              data-testid={`ingredient-${ingredient.id}`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium capitalize">{ingredient.name}</h3>
                <button
                  onClick={() => removeIngredient(ingredient.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  data-testid={`remove-ingredient-${ingredient.id}`}
                >
                  Remove
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{ingredient.percentage.toFixed(1)}%</span>
                  <span>{ingredient.weight}g</span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={ingredient.percentage}
                  onChange={(e) => handlePercentageChange(ingredient.id, Number(e.target.value))}
                  className="ingredient-slider"
                  data-testid={`percentage-slider-${ingredient.id}`}
                />
                
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {ingredient.nutrition.calories} cal • 
                  P: {ingredient.nutrition.protein}g • 
                  C: {ingredient.nutrition.carbs}g • 
                  F: {ingredient.nutrition.fat}g
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep('weight')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setStep('review')}
            disabled={Math.abs(totalPercentage - 100) > 0.1}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            data-testid="proceed-to-review"
          >
            Review
          </button>
        </div>
      </div>
    )
  }

  // Review Step
  if (step === 'review') {
    const totalNutrition = calculateMealNutrition(ingredients)

    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Review Meal</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Confirm your meal details
          </p>
        </div>

        {photo && (
          <div className="flex justify-center">
            <img
              src={photo}
              alt="Your meal"
              className="w-48 h-36 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Nutrition Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Nutrition Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{totalNutrition.calories}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{totalNutrition.protein}g</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{totalNutrition.carbs}g</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{totalNutrition.fat}g</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Fat</div>
            </div>
          </div>
        </div>

        {/* Ingredients List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Ingredients ({totalWeight}g total)</h3>
          <div className="space-y-2">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex justify-between items-center">
                <span className="capitalize">{ingredient.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {ingredient.weight}g ({ingredient.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep('ingredients')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSaveMeal}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            data-testid="save-meal"
          >
            Save Meal
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default AddMeal