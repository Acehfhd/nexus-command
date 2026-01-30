#!/bin/bash
set -e

echo "🚀 Building and starting GPU Dev Container..."

# Ensure the config dir exists
cd "$(dirname "$0")"

# Check DISPLAY is set
if [ -z "$DISPLAY" ]; then
    echo "⚠️  DISPLAY is not set. Attempting to detect..."
    # Common display values
    if [ -S /tmp/.X11-unix/0 ]; then
        export DISPLAY=:0
        echo "✅ Set DISPLAY to :0"
    elif [ -S /tmp/.X11-unix/1 ]; then
        export DISPLAY=:1
        echo "✅ Set DISPLAY to :1"
    else
        echo "❌ Could not auto-detect DISPLAY. Please set it manually:"
        echo "   export DISPLAY=:0  # or :1, :2, etc."
        exit 1
    fi
fi

echo "📺 Using DISPLAY=$DISPLAY"

# Allow local connections to X server (for GUI support)
echo "🖥️  Enabling GUI display..."
xhost +local:docker 2>/dev/null || echo "⚠️  xhost might not be available, GUI may not work"

# Build and verify permissions
echo "🔧 Checking GPU permissions..."
if [ -e /dev/kfd ] && [ -r /dev/kfd ] && [ -w /dev/kfd ]; then
    echo "✅ /dev/kfd is accessible."
else
    echo "⚠️  /dev/kfd might not be accessible. You may need to add your user to the render group:"
    echo "   sudo usermod -aG render $USER"
fi

# Build with host network to avoid apt connection issues
echo "🔨 Building image with host network..."
docker build --network=host -t antigravity-gpu-dev:latest .

# Up the container
echo "🚀 Starting container..."
docker compose up -d

echo "✅ Container is running!"
echo "📝 Container name: gpu-dev-container"
echo "💡 To test GUI, run inside container: xdpyinfo | head -10"
echo "💻 Connecting to shell..."
docker compose exec dev-box bash
