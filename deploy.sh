#!/bin/bash
# deploy.sh - Deploy the SAS platform using Docker Compose
set -e

echo "🚀 SAS Platform - Docker Compose Deploy"
echo "========================================"

# Check if .env exists in backend-nodejs, if not copy example
if [ ! -f "backend-nodejs/.env" ]; then
  echo "⚠️  No backend .env found. Copying from .env.example..."
  cp backend-nodejs/.env.example backend-nodejs/.env
  echo "✅ Created backend-nodejs/.env - please edit it with your real API keys before deploying!"
fi

# Check for required environment variables in docker-compose
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 64)
  echo "ℹ️  Generated SESSION_SECRET. Add it to your .env file to persist it."
fi

if [ -z "$ENCRYPTION_KEY" ]; then
  export ENCRYPTION_KEY=$(openssl rand -hex 16 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 32)
  echo "ℹ️  Generated ENCRYPTION_KEY. Add it to your .env file to persist it."
fi

echo ""
echo "🔨 Building Docker images..."
docker compose build

echo ""
echo "🗄️  Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for backend to be healthy..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
    break
  fi
  sleep 2
done

echo ""
echo "✅ Deployment complete!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📋 To view logs: docker compose logs -f"
echo "🛑 To stop:      docker compose down"
