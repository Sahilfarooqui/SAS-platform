#!/bin/bash
# start.sh - Start the SAS platform locally for development
set -e

echo "🛠️  SAS Platform - Local Development Start"
echo "==========================================="

# Check if backend .env exists
if [ ! -f "backend-nodejs/.env" ]; then
  echo "⚠️  No backend .env found. Copying from .env.example..."
  cp backend-nodejs/.env.example backend-nodejs/.env
  echo "✅ Created backend-nodejs/.env - please edit it with your API keys."
fi

# Install backend dependencies if needed
if [ ! -d "backend-nodejs/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  (cd backend-nodejs && npm install)
fi

# Run prisma migrations
echo "🗄️  Running database migrations..."
(cd backend-nodejs && DATABASE_URL=file:./dev.db npx prisma migrate deploy)

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo ""
echo "🚀 Starting backend on http://localhost:5000 ..."
(cd backend-nodejs && node index.js) &
BACKEND_PID=$!

echo "🚀 Starting frontend on http://localhost:3000 ..."
(cd frontend && REACT_APP_API_URL=http://localhost:5000 npm start) &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait for any process to exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
