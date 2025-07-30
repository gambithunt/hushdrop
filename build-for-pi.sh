#!/bin/bash

# Build HushDrop for Raspberry Pi 4 (ARM64)

echo "🏗️  Building HushDrop for Raspberry Pi 4..."

# Ensure buildx is available
docker buildx create --use --name multiarch 2>/dev/null || docker buildx use multiarch

# Build for ARM64
echo "📦 Building ARM64 image..."
docker buildx build \
    --platform linux/arm64 \
    --tag hushdrop:pi4 \
    --load \
    .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "💾 Saving image to file..."
    docker save hushdrop:pi4 > hushdrop-pi4.tar
    echo "📁 Image saved as: hushdrop-pi4.tar"
    echo "📊 Image size: $(du -h hushdrop-pi4.tar | cut -f1)"
    echo ""
    echo "Next steps:"
    echo "1. Transfer to Pi: scp hushdrop-pi4.tar pi@your-pi-ip:/home/pi/"
    echo "2. Load on Pi: docker load < hushdrop-pi4.tar"
    echo "3. Deploy with the files in pi-deployment/"
else
    echo "❌ Build failed!"
    exit 1
fi