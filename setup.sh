#!/bin/bash

# Setup script for Audio Transcript Summarizer (Docker-only)
echo "Setting up Audio Transcript Summarizer..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is required but not installed."
    echo "Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is required but not installed."
    echo "Please install Docker Compose and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env file and add your OpenAI API key for summarization."
else
    echo "✅ .env file already exists"
fi

# Create uploads directory (for local development convenience)
mkdir -p uploads

echo ""
echo "🚀 Setup complete!"
echo ""
echo "To run the application:"
echo "  Development: docker-compose up app-dev"
echo "  Production:  docker-compose --profile production up app"
echo ""
echo "📝 Important notes:"
echo "1. Add your OpenAI API key to .env file for summarization"
echo "2. First run will download Whisper models (may take 5-10 minutes)"
echo "3. All dependencies are contained in Docker - no local installation needed"
echo "4. Whisper models and uploads are persisted in Docker volumes"
echo ""
echo "🌐 Access the app at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"