# Food Tracker PWA 🥗📱

A fully offline Progressive Web App that uses AI to track your nutrition by analyzing food photos. Built with React, TypeScript, and TensorFlow.js for complete privacy and offline functionality.

## ✨ Features

### 🤖 AI-Powered Food Recognition
- **Offline TensorFlow.js**: Uses MobileNet for on-device food classification
- **Smart Ingredient Detection**: Identifies multiple ingredients from a single photo
- **Confidence Scoring**: Shows prediction accuracy for detected foods
- **Manual Adjustment**: Edit, remove, or adjust detected ingredients

### 📊 Nutrition Tracking
- **Comprehensive Database**: 40+ common foods with accurate nutrition data
- **Portion Control**: Input total weight and adjust ingredient percentages
- **Real-time Calculations**: Live macro calculations as you adjust portions
- **Daily Progress**: Track calories, protein, carbs, and fat against your goals

### 📱 Progressive Web App
- **100% Offline**: Works completely without internet after installation
- **iOS Optimized**: Designed specifically for iPhone Safari PWA installation
- **Native Feel**: Fullscreen experience with proper safe areas
- **Fast Loading**: Service worker caching for instant startup

### 🔒 Privacy First
- **Local Storage**: All data stays on your device using IndexedDB
- **No Tracking**: Zero analytics, no user accounts, no data collection
- **Offline ML**: AI processing happens entirely on your device
- **No Backend**: No servers, APIs, or cloud dependencies

### 📸 Camera Integration
- **Native Camera**: Access device camera for photo capture
- **File Upload**: Alternative photo upload for flexibility
- **Photo Storage**: Meals saved with photos for reference
- **Optimized Images**: Efficient storage with quality compression

## 🚀 Getting Started

### Installation as PWA (iOS)
1. Open Safari and navigate to the app
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Tap "Add" to install the app
5. Launch from your home screen for full offline experience

### Development Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing

### AI & ML
- **TensorFlow.js** - Browser-based machine learning
- **MobileNet** - Lightweight image classification model
- **On-Device Processing** - No cloud API dependencies
- **Food Mapping** - Custom logic to map predictions to nutrition database

### Data & Storage
- **IndexedDB** - Browser database for offline storage
- **IDB Library** - Modern IndexedDB wrapper
- **Local JSON** - Static nutrition database
- **Base64 Images** - Efficient photo storage

### PWA Features
- **Service Worker** - Offline caching and background sync
- **Web App Manifest** - Installation and app-like behavior
- **Responsive Design** - Mobile-first responsive layouts
- **Touch Optimized** - Gesture-friendly interface

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Daily overview and progress
│   ├── AddMeal.tsx      # Camera capture and AI analysis
│   ├── History.tsx      # Meal history and details
│   ├── Settings.tsx     # User preferences and goals
│   └── Layout.tsx       # App shell and navigation
├── context/             # State management
│   └── AppContext.tsx   # Global app state with React Context
├── utils/               # Utility functions
│   ├── mlModel.ts       # TensorFlow.js integration
│   ├── nutritionCalculator.ts  # Macro calculations
│   └── storage.ts       # IndexedDB operations
├── types/               # TypeScript definitions
│   └── index.ts         # Shared type definitions
└── main.tsx             # App entry point
```

## 🍎 Food Recognition

The app can identify 40+ common foods including:
- **Fruits**: Apple, banana, orange, strawberry, grapes, watermelon
- **Proteins**: Chicken, beef, fish, eggs, nuts
- **Grains**: Bread, rice, pasta, oats
- **Vegetables**: Broccoli, carrots, tomatoes, peppers, spinach
- **Dairy**: Milk, cheese, yogurt
- **And more**: Complete list in `/public/nutrition.json`

## 💾 Data Storage

All user data is stored locally using IndexedDB:
- **Meals**: Photos, timestamps, ingredients, nutrition data
- **Settings**: Daily goals, preferences, theme settings
- **No Sync**: Data remains private on your device
- **Export**: Manual export/import capabilities (future feature)

## 🎯 Nutrition Accuracy

The app provides nutrition estimates based on:
- **USDA Food Data**: Nutrition values per 100g for accuracy
- **Weight-Based Calculations**: Precise portions using total weight
- **Multiple Ingredients**: Smart distribution across detected foods
- **User Adjustable**: Manual override for better accuracy

## 🔧 Customization

### Adding New Foods
1. Update `/public/nutrition.json` with new food entries
2. Add mapping in `mlModel.ts` for AI recognition
3. Nutrition values should be per 100g for consistency

### Modifying ML Model
- Current: MobileNet for general object recognition
- Alternative: Custom food-specific model training
- Trade-off: Model size vs. accuracy for specific foods

## 📊 Performance

- **Model Loading**: ~5-10MB TensorFlow.js + MobileNet
- **Startup Time**: <2 seconds on modern devices
- **Photo Processing**: 1-3 seconds for AI analysis
- **Storage Efficient**: Compressed images and optimized data structures
- **Memory Usage**: <50MB typical usage

## 🛠️ Development

### Key Components

**AddMeal.tsx** - Multi-step meal addition:
1. Photo capture/upload
2. Weight input
3. Ingredient adjustment
4. Nutrition review and save

**mlModel.ts** - AI integration:
- Model loading and caching
- Image preprocessing
- Prediction filtering and mapping

**nutritionCalculator.ts** - Macro calculations:
- Per-ingredient nutrition based on weight
- Total meal nutrition aggregation
- Percentage validation and adjustment

### Testing Strategy
- Component testing with React Testing Library
- E2E testing for critical user flows
- PWA functionality testing on actual devices
- Camera and file upload testing across browsers

## 🚀 Deployment

The app is designed for static hosting:
- **Netlify/Vercel**: Recommended for automatic deployments
- **GitHub Pages**: Alternative static hosting
- **CDN**: All assets can be served from CDN
- **HTTPS Required**: For camera access and PWA features

## 🔮 Future Enhancements

- **Barcode Scanning**: Add packaged food tracking
- **Custom Foods**: User-defined food database entries
- **Meal Templates**: Save and reuse common meals
- **Export Data**: Backup and data portability
- **Multiple Cameras**: Support for different camera modes
- **Voice Notes**: Audio meal descriptions
- **Water Tracking**: Hydration monitoring
- **Weight Tracking**: Body weight trends

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

---

**Built with ❤️ for health-conscious developers who value privacy and offline functionality.**