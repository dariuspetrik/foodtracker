# Food Tracker PWA - Test Suite

This directory contains Playwright end-to-end tests for all core features of the Food Tracker PWA.

## Test Files

- **`dashboard.test.ts`** - Tests daily tracking dashboard, macro progress, and meal display
- **`add-meal.test.ts`** - Tests food recognition workflow, camera/upload functionality
- **`meal-workflow.test.ts`** - Tests weight input, ingredient adjustment, and nutrition calculation
- **`history.test.ts`** - Tests meal history browsing, date selection, and meal deletion
- **`settings.test.ts`** - Tests nutrition goal configuration, dark mode, and data management
- **`navigation.test.ts`** - Tests PWA navigation, routing, and offline characteristics
- **`complete-workflow.test.ts`** - Integration tests covering complete user journeys

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (with browser window)
npm run test:headed

# Run specific test file
npx playwright test dashboard.test.ts
```

## Test Configuration

- Tests use the built production version of the app (`npm run build && npm run preview`)
- Runs on `http://localhost:4173`
- Tests across Chrome, Firefox, Safari, and Mobile Chrome
- Uses data-testid attributes for reliable element selection

## Key Testing Patterns

1. **Real Implementation Testing** - No mocks, tests actual app functionality
2. **Data Persistence** - Tests verify local storage and IndexedDB work correctly
3. **Offline Behavior** - Tests check PWA offline capabilities
4. **Cross-browser** - Tests run on multiple browsers and mobile viewports
5. **ML Pipeline** - Tests include AI model loading and food recognition flow

## Notes

- Some ML model tests may show "No food items detected" with test images - this validates the error handling
- Camera tests may fail in headless mode - this is expected behavior
- Tests preserve and verify data persistence across page reloads
- All tests use data-testid attributes to avoid brittle selectors