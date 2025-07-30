#!/bin/bash

# HushDrop Raspberry Pi 4 Setup Script

echo "🍓 Setting up HushDrop on Raspberry Pi 4..."

# Check if running on ARM64
if [ "$(uname -m)" != "aarch64" ]; then
    echo "⚠️  Warning: This script is optimized for ARM64 (Pi 4). Current architecture: $(uname -m)"
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    sudo apt install -y docker-compose
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo ""
    echo "🔑 Please edit .env and add your OpenAI API key:"
    echo "   nano .env"
    echo ""
fi

# Create data directory for persistent storage
mkdir -p data

# Set proper permissions
sudo chown -R $USER:$USER .

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Add your OpenAI API key"
echo "3. Run: docker-compose --profile production up -d app"
echo "4. Access at: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "For CasaOS integration, import the casaos-app.yml file"