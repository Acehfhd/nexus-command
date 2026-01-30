# 🎮 Connect Arcade Pod

Lightweight GPU container for **game development** (Pygame, SDL2).

## What's Included
- Python 3.12 + venv
- Pygame
- SDL2 (full stack: image, mixer, ttf)
- NumPy, Pillow
- X11/Audio passthrough for GUI games

## What's NOT Included (saves ~18GB)
- ❌ Node.js
- ❌ Rust
- ❌ Java
- ❌ PyTorch/ROCm AI stack
- ❌ Web frameworks (Flask, FastAPI)
- ❌ Transformers, HuggingFace

## Build & Run

```bash
cd /home/anon/AI\ work/anon/projects/tools/Nexus_Connector/Nexus_DevPods/01_Connect_Arcade

# Build the image
docker-compose build

# Start container
docker-compose up -d

# Enter container
docker exec -it connect-arcade bash

# Run a game
cd /workspace/games/flappy_bird
python main.py
```

## GPU Verification
```bash
# Inside container
rocminfo | head -20
```

## Estimated Size
- **Big Container**: ~26GB
- **Arcade Pod**: ~4-6GB

## Volume Mounts
| Host | Container | Purpose |
|------|-----------|---------|
| `AI work/anon/projects/games` | `/workspace/games` | Game projects |
