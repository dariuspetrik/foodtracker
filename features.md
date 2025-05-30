# Food Tracker PWA - Core Features

## 1. Food Recognition from Image (Offline ML)
- **User Interactions**: Take photo or upload image, review detected ingredients, edit/remove predictions
- **Business Logic**: TensorFlow.js MobileNet classification, confidence scoring, ingredient filtering
- **Database Operations**: Store processed images as base64 in IndexedDB

## 2. Meal Weight & Portion Assignment
- **User Interactions**: Enter total meal weight, adjust ingredient percentages via sliders
- **Business Logic**: Default equal distribution, percentage validation (sum = 100%), portion calculation
- **Database Operations**: None (calculated values only)

## 3. Nutrition Calculation
- **User Interactions**: Review calculated macros, save meal entry
- **Business Logic**: Lookup nutrition data from local JSON, calculate per-ingredient portions, sum totals
- **Database Operations**: Store final meal data with nutrition breakdown

## 4. Dashboard & Daily Tracking
- **User Interactions**: View daily progress, see remaining macro targets, quick meal addition
- **Business Logic**: Aggregate daily totals, calculate progress percentages, goal tracking
- **Database Operations**: Query today's meals, read user goals from settings

## 5. Meal History
- **User Interactions**: Browse past meals, view photos, edit/delete entries
- **Business Logic**: Date filtering, search functionality, meal modification
- **Database Operations**: CRUD operations on meal entries, image retrieval

## 6. Settings & Configuration
- **User Interactions**: Set macro goals, toggle dark mode, configure units
- **Business Logic**: Form validation, preference persistence, theme switching
- **Database Operations**: Store/retrieve user preferences and daily targets

## 7. PWA & Offline Support
- **User Interactions**: Install app, use offline, receive update notifications
- **Business Logic**: Service worker caching, background sync, update management
- **Database Operations**: Cache ML models and nutrition data for offline use