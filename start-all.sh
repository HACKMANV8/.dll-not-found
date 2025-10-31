#!/bin/bash

# Start all servers for Gensec Dashboard

echo "🚀 Starting Gensec Dashboard..."
echo ""

# Check if node_modules exists in server
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
    echo ""
fi

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

# Start backend server in background
echo "🔧 Starting authentication server on port 3001..."
cd server && npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 2

# Start frontend
echo "🎨 Starting frontend on port 5173..."
echo ""
echo "================================"
echo "✅ Backend:  http://localhost:3001"
echo "✅ Frontend: http://localhost:5173"
echo "================================"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

npm run dev

# Cleanup: kill backend when frontend stops
kill $SERVER_PID 2>/dev/null
