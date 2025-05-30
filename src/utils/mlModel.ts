import * as mobilenet from '@tensorflow-models/mobilenet'
import '@tensorflow/tfjs'
import { MLPrediction } from '../types'

let model: mobilenet.MobileNet | null = null

export const loadModel = async (): Promise<mobilenet.MobileNet> => {
  if (model) return model
  
  try {
    console.log('Loading MobileNet model...')
    model = await mobilenet.load()
    console.log('MobileNet model loaded successfully')
    return model
  } catch (error) {
    console.error('Failed to load MobileNet model:', error)
    throw new Error('Failed to load AI model')
  }
}

export const classifyImage = async (imageElement: HTMLImageElement): Promise<MLPrediction[]> => {
  try {
    if (!imageElement || !imageElement.complete) {
      throw new Error('Invalid image element')
    }

    const loadedModel = await loadModel()
    if (!loadedModel) {
      throw new Error('Model not loaded')
    }

    console.log('Running image classification...')
    
    const predictions = await loadedModel.classify(imageElement)
    console.log('Raw predictions:', predictions)
    
    if (!predictions || !Array.isArray(predictions)) {
      console.warn('Invalid predictions received:', predictions)
      return []
    }

    // Filter and map food-related predictions
    const foodPredictions = predictions
      .filter(pred => pred && pred.probability > 0.1 && pred.className) // Only show predictions above 10%
      .slice(0, 5) // Take top 5 predictions
      .map(pred => {
        const mappedName = mapToFoodName(pred.className)

        return mappedName ? {
          className: mappedName,
          probability: pred.probability
        } : null
      })
      .filter((pred): pred is MLPrediction => pred !== null) // Remove any null results (non-food items)
    
    console.log('Filtered food predictions:', foodPredictions)
    return foodPredictions
  } catch (error) {
    console.error('Image classification failed:', error)
    throw new Error('Failed to analyze image')
  }
}

// Map MobileNet class names to food names in our nutrition database
const mapToFoodName = (className: string): string | null => {
  const foodMappings: { [key: string]: string } = {
    'banana': 'banana',
    'orange': 'orange',
    'apple': 'apple',
    'strawberry': 'strawberry',
    'broccoli': 'broccoli',
    'carrot': 'carrot',
    'mushroom': 'mushroom',
    'bell pepper': 'bell pepper',
    'tomato': 'tomato',
    'cucumber': 'cucumber',
    'pizza': 'bread',
    'bagel': 'bread',
    'pretzel': 'bread',
    'hotdog': 'beef',
    'hamburger': 'beef',
    'cheeseburger': 'beef',
    'meat loaf': 'beef',
    'steak': 'beef',
    'fried chicken': 'chicken breast',
    'roast chicken': 'chicken breast',
    'grilled salmon': 'salmon',
    'tuna': 'fish',
    'sushi': 'fish',
    'french fries': 'potato',
    'baked potato': 'potato',
    'mashed potato': 'potato',
    'spaghetti': 'pasta',
    'ravioli': 'pasta',
    'macaroni': 'pasta',
    'fried rice': 'rice',
    'risotto': 'rice',
    'chocolate cake': 'chocolate',
    'ice cream': 'milk',
    'cheese': 'cheese',
    'omelet': 'egg',
    'scrambled eggs': 'egg',
    'boiled egg': 'egg',
    'salad': 'lettuce',
    'soup': 'broccoli', // Default to a vegetable
    'sandwich': 'bread',
    'burrito': 'bread',
    'taco': 'beef',
    'corn': 'carrot', // Map to similar nutrition profile
    'peas': 'broccoli',
    'beans': 'nuts',
    'avocado': 'avocado',
    'grapes': 'grapes',
    'watermelon': 'watermelon',
    'blueberry': 'blueberry'
  }

  // List of food-related words that might appear in MobileNet predictions
  const foodKeywords = [
    'food', 'fruit', 'vegetable', 'meat', 'chicken', 'beef', 'fish', 'bread', 
    'rice', 'potato', 'egg', 'cheese', 'milk', 'cake', 'cookie', 'pie', 
    'dish', 'meal', 'cuisine', 'plate', 'bowl', 'edible', 'nutrition'
  ]

  const normalizedClassName = className.toLowerCase()

  // Try exact match first
  if (foodMappings[normalizedClassName]) {
    return foodMappings[normalizedClassName]
  }

  // Try partial matches for known food mappings
  for (const [key, value] of Object.entries(foodMappings)) {
    if (normalizedClassName.includes(key) || key.includes(normalizedClassName)) {
      return value
    }
  }

  // Check if prediction contains any food-related keywords
  const containsFoodKeyword = foodKeywords.some(keyword => 
    normalizedClassName.includes(keyword)
  )

  if (!containsFoodKeyword) {
    // Not food-related, return null
    return null
  }

  // For food-related predictions that don't have a specific mapping,
  // try to extract a recognizable food word
  const foodWords = ['chicken', 'beef', 'fish', 'bread', 'rice', 'potato', 'egg', 'cheese', 'milk']
  for (const word of foodWords) {
    if (normalizedClassName.includes(word)) {
      return word === 'chicken' ? 'chicken breast' : word
    }
  }

  // If it seems food-related but we can't map it specifically, return null
  // This prevents non-food items from being forced into food categories
  return null
}

export const isModelLoaded = (): boolean => {
  return model !== null
}