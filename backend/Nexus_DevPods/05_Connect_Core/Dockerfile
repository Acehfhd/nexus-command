FROM python:3.10-slim

WORKDIR /workspace

# Install system dependencies (Audio/UI/Docker)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    procps \
    ffmpeg \
    espeak-ng \
    nodejs \
    npm \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Python Libs (Nexus Stack)
RUN pip install --no-cache-dir \
    nicegui \
    pandas \
    requests \
    python-dotenv \
    solana \
    solders \
    argon2-cffi \
    openai-whisper \
    kokoro-onnx \
    soundfile \
    redis \
    plotly \
    "google-adk[extensions]>=1.22.0" \
    chromadb \
    mcp \
    pyyaml \
    docker \
    apscheduler \
    email-validator \
    asyncpg \
    fastapi-sso

# Copy startup script
COPY start.sh /start.sh

# Run startup script
CMD ["/start.sh"]
