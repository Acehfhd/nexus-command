# GPU Dev Container Guide

## Quick Start

### 1. Start the Environment
Run the helper script to build the image and start the container:

```bash
./start_dev_container.sh
```

*Note: The build uses the host network to ensure stable downloads.*

### 2. Verify Installation
Once inside the container shell, run:

```bash
python3.12 --version
pip list
rocminfo | head -n 10
node --version
rustc --version
javac --version
```

### 3. Test GUI Support (Important for Flappy Bird)
Test that X11 display forwarding is working:

```bash
./test_gui.sh
```

This will verify:
- X11 connection to the host display
- Environment variables (DISPLAY, SDL_VIDEODRIVER)
- pygame installation
- pygame display initialization

### 4. Run Flappy Bird Game
Once GUI is verified:

```bash
cd /workspace/games/flappy_bird
python3 run_game.py
```

The game window should appear on your host X11 display!

### 5. Stop the Environment
When finished, run from the host (not inside container):

```bash
./stop_dev_container.sh
```

---

## Architecture Notes

### Base Image
- **rocm/dev-ubuntu-22.04:6.1** provides stable ROCm drivers for your RX 7900 GRE
- This is isolated from your host OS (Ubuntu 24.04)
- The container handles all build dependencies

### GUI Support (X11 Forwarding)
The container is configured with:
- **X11 Socket**: `/tmp/.X11-unix` mounted for display
- **DISPLAY Variable**: Automatically set from host
- **SDL2 Backend**: `SDL_VIDEODRIVER=x11` for pygame
- **Xauthority**: `/tmp/.Xauthority` mounted for authentication

### Audio Support
- **Device Mapping**: `/dev/snd` mounted for ALSA audio
- **Audio Driver**: `SDL_AUDIODRIVER=alsa` configured
- **Graceful Fallback**: Game creates dummy sounds if audio fails (won't crash)

### Python Environment
- **Python 3.12** installed manually (via deadsnakes PPA)
- **Virtual Environment**: Located at `/opt/venv` inside container
- **Packages**: pygame, numpy, pandas, requests, flask, fastapi, uvicorn

### Networking
- **Host Networking**: Container shares host network stack
- **Ollama Access**: Can connect to `http://localhost:11434` directly
- **Port Exposure**: 8000, 8080, 5000, 7860 available

---

## Troubleshooting

### "Cannot connect to X11 display"
```bash
# From host terminal, verify DISPLAY is set:
echo $DISPLAY
# Should show something like `:0` or `:1`

# If not set, set it manually before running container:
export DISPLAY=:0
./start_dev_container.sh
```

### "Permission Denied (/dev/kfd)"
Ensure your user is in the render group:
```bash
sudo usermod -aG render $USER
# Then logout and login again for changes to take effect
```

### "xhost: unable to open display"
This means X11 is not running. You need a display server:
- **X11**: Run `startx` or use your DE's login manager
- **Wayland**: Some issues may occur; consider switching to X11

### "Game window appears but no graphics"
Inside the container, verify:
```bash
./test_gui.sh
```

If pygame display initialization fails, check:
1. DISPLAY is correct: `echo $DISPLAY`
2. X11 forwarding enabled: `xhost +local:docker`
3. SDL2 libs installed: `dpkg -l | grep libsdl2`

### "Audio not working"
This is normal and expected. The game handles it gracefully:
- `assets.py` creates dummy sounds if ALSA fails
- Game runs perfectly fine in silent mode
- Audio device is optional

---

## Environment Variables Inside Container

```bash
DISPLAY          # X11 display (e.g., :0)
SDL_VIDEODRIVER=x11        # Force X11 backend for pygame
SDL_AUDIODRIVER=alsa       # Use ALSA for audio
QT_X11_NO_MITSHM=1         # Disable SHM for X11 safety
XAUTHORITY=/tmp/.Xauthority # X11 auth file
```

---

## GPU & Development Resources

- **ROCm Documentation**: https://rocmdocs.amd.com/
- **Flappy Bird Source**: `/workspace/games/flappy_bird/`
- **Project Workspace**: Mounted at `/workspace`
- **Python Packages**: Pre-installed in `/opt/venv`

---

## File Structure

```
docker-env/
├── Dockerfile               # Container image definition
├── docker-compose.yml       # Container configuration
├── start_dev_container.sh   # Build and start script
├── stop_dev_container.sh    # Stop and cleanup script
├── test_gui.sh             # Verify GUI functionality
└── README.md               # This file
```

---

## Notes

- **Shared Code**: Changes in `/home/anon/AI work/anon/projects` are instantly visible in `/workspace`
- **Rebuild**: To rebuild image after changing Dockerfile: `docker build --network=host -t antigravity-gpu-dev:latest .`
- **Container Name**: `gpu-dev-container` (use for docker commands)
- **Image Name**: `antigravity-gpu-dev:latest`
