FROM rocm/dev-ubuntu-22.04:6.1

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update mirrors to US for better reliability
RUN sed -i 's/archive.ubuntu.com/us.archive.ubuntu.com/g' /etc/apt/sources.list \
    && apt-get update || true

# Install System Dependencies (ROCm is already in base)
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    git-lfs \
    cmake \
    pkg-config \
    libsdl2-dev \
    libsdl2-image-dev \
    libsdl2-mixer-dev \
    libsdl2-ttf-dev \
    libx11-dev \
    libxext-dev \
    libxrender-dev \
    x11-utils \
    curl \
    wget \
    gnupg \
    software-properties-common \
    alsa-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Python 3.12 via deadsnakes
RUN add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update && apt-get install -y \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && chmod -R a+w $RUSTUP_HOME $CARGO_HOME

# Install Java 21
RUN apt-get update && apt-get install -y openjdk-21-jdk || (add-apt-repository ppa:openjdk-r/ppa -y && apt-get update && apt-get install -y openjdk-21-jdk)

# Set up Virtual Environment with Python 3.12
ENV VIRTUAL_ENV=/opt/venv
RUN python3.12 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Python Libraries (Base)
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 \
    && pip install --no-cache-dir \
    pygame \
    "numpy<2" \
    pandas \
    requests \
    flask \
    fastapi \
    uvicorn

# Install AI Training Libraries (ROCm PyTorch + HuggingFace)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/rocm5.6 \
    && pip install --no-cache-dir \
    transformers \
    peft \
    datasets \
    trl \
    accelerate \
    sentencepiece \
    protobuf \
    scipy \
    tqdm

WORKDIR /workspace

EXPOSE 8000 8080 5000 7860
