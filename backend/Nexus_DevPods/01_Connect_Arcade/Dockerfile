# Connect Arcade Pod
# Lightweight GPU container for game development (Pygame, SDL2)
# Replaces the monolithic gpu-dev-container for game projects

FROM rocm/dev-ubuntu-22.04:6.1

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update mirrors
RUN sed -i 's/archive.ubuntu.com/us.archive.ubuntu.com/g' /etc/apt/sources.list \
    && apt-get update || true

# Install ONLY game development dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    pkg-config \
    libsdl2-dev \
    libsdl2-image-dev \
    libsdl2-mixer-dev \
    libsdl2-ttf-dev \
    libx11-dev \
    libxext-dev \
    libxrender-dev \
    x11-utils \
    alsa-utils \
    curl \
    software-properties-common \
    mesa-vulkan-drivers \
    && rm -rf /var/lib/apt/lists/*

# Install Python 3.12 (minimal)
RUN add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update && apt-get install -y \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set up Virtual Environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3.12 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install ONLY game libraries (no AI, no web frameworks)
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 \
    && pip install --no-cache-dir \
    pygame \
    "numpy<2" \
    Pillow

WORKDIR /workspace

# Game-specific ports
EXPOSE 8080

# Default command
CMD ["bash"]
