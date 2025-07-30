#!/bin/bash

echo "🧪 Testing HushDrop locally (ARM64 Mac M4)..."

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "📄 Loaded environment variables from .env"
else
    echo "⚠️  No .env file found, using defaults"
fi

# Use the same Pi image since architectures match
echo "📦 Building ARM64 image (same as Pi)..."
./build-for-pi.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Stop any existing test container
docker stop hushdrop-test 2>/dev/null
docker rm hushdrop-test 2>/dev/null

# Run locally
echo "🚀 Starting test container..."
docker run -d \
  --name hushdrop-test \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e OPENAI_API_KEY=${OPENAI_API_KEY:-test_key} \
  hushdrop:pi4

# Wait a moment for startup
sleep 3

# Check if it's running
if docker ps | grep -q hushdrop-test; then
    echo "✅ Container is running!"
    echo "🌐 Test at: http://localhost:3001"
    echo "📊 Health check: http://localhost:3001/api/health"
    echo ""
    echo "📋 Logs:"
    docker logs hushdrop-test
    echo ""
    echo "To stop: docker stop hushdrop-test && docker rm hushdrop-test"
else
    echo "❌ Container failed to start"
    echo "📋 Logs:"
    docker logs hushdrop-test
fi