#!/bin/bash
echo "Building the app..."
npm run build

echo "Starting preview server..."
npm run preview &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 5

echo "Running basic functionality test..."
npx playwright test tests/basic-functionality.test.ts --headed

echo "Stopping server..."
kill $SERVER_PID