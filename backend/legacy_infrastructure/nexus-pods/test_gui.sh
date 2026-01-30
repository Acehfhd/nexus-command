#!/bin/bash

echo "🧪 Testing Docker Container GUI Configuration"
echo "=================================================="
echo ""

echo "1️⃣  Checking X11 Connection..."
if command -v xdpyinfo &> /dev/null; then
    if xdpyinfo -display "$DISPLAY" &>/dev/null; then
        echo "✅ X11 display is accessible"
        xdpyinfo -display "$DISPLAY" | grep -E "screen|depth"
    else
        echo "❌ Cannot connect to X11 display: $DISPLAY"
    fi
else
    echo "❌ xdpyinfo not found"
fi

echo ""
echo "2️⃣  Checking Environment Variables..."
echo "   DISPLAY=$DISPLAY"
echo "   SDL_VIDEODRIVER=${SDL_VIDEODRIVER:-not set}"
echo "   SDL_AUDIODRIVER=${SDL_AUDIODRIVER:-not set}"

echo ""
echo "3️⃣  Checking pygame installation..."
python3 -c "import pygame; print(f'✅ pygame {pygame.__version__} installed')" 2>&1 || echo "❌ pygame not installed"

echo ""
echo "4️⃣  Testing pygame display initialization..."
python3 << 'PYEOF'
import os
import sys
os.environ['SDL_VIDEODRIVER'] = 'x11'

try:
    import pygame
    pygame.init()
    print("✅ pygame.init() successful")
    
    # Test display setup
    screen = pygame.display.set_mode((100, 100))
    print("✅ Display mode (100x100) created successfully")
    pygame.quit()
    print("✅ pygame test passed - GUI should work!")
except Exception as e:
    print(f"❌ pygame test failed: {e}")
    sys.exit(1)
PYEOF

echo ""
echo "5️⃣  Checking audio..."
if [ -e /dev/snd ]; then
    echo "✅ /dev/snd exists (audio device available)"
    ls -la /dev/snd/ | head -5
else
    echo "⚠️  /dev/snd not available (audio will be silent)"
fi

echo ""
echo "=================================================="
echo "✨ GUI test complete!"
