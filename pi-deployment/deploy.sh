#!/bin/bash

# Quick deployment script for Pi

echo "🍓 Deploying HushDrop on Raspberry Pi..."

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file - please edit it with your OpenAI API key"
    echo "   nano .env"
    read -p "Press enter after editing .env file..."
fi

# Create data directory
mkdir -p data

# Stop existing container if running
docker-compose down

# Start the application
docker-compose up -d

echo "✅ HushDrop is starting up..."
echo "🌐 Access at: http://$(hostname -I | awk '{print $1}'):3000"
echo "📊 Check status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f"