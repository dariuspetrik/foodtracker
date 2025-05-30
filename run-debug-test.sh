#!/bin/bash

echo "🚀 Running debug test for Food Tracker PWA"
echo ""

# Build the app
echo "📦 Building the app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Start preview server in background
echo "🌐 Starting preview server..."
npm run preview &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test if server is responsive
echo "🔗 Testing server connection..."
curl -s http://localhost:4173 > /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Server is not responsive!"
    kill $SERVER_PID
    exit 1
fi

echo "✅ Server is running"

# Run our debug test
echo "🧪 Running debug test..."
npx playwright test test-basic.ts --headed --timeout=30000

TEST_RESULT=$?

# Stop the server
echo "🛑 Stopping server..."
kill $SERVER_PID

# Report results
if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed!"
    echo "✅ Food Tracker PWA is working correctly"
else
    echo ""
    echo "❌ Tests failed!"
    echo "🔍 Check the browser output above for details"
fi

exit $TEST_RESULT