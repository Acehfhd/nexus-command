# Connect Forge Pod
# Heavy development: Rust, C++, AI Training (PyTorch/ROCm)

FROM rocm/dev-ubuntu-22.04:6.1

ENV DEBIAN_FRONTEND=noninteractive

# Update mirrors
RUN sed -i 's/archive.ubuntu.com/us.archive.ubuntu.com/g' /etc/apt/sources.list \
    && apt-get update || true

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    git-lfs \
    cmake \
    pkg-config \
    curl \
    wget \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Python 3.12
RUN add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update && apt-get install -y \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && chmod -R a+w $RUSTUP_HOME $CARGO_HOME

# Java 21 (for Minecraft modding)
RUN apt-get update && apt-get install -y openjdk-21-jdk gradle \
    && rm -rf /var/lib/apt/lists/*

# Virtual Environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3.12 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Python packages: AI Training Stack
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 \
    && pip install --no-cache-dir \
    "numpy<2" \
    pandas \
    requests

# PyTorch ROCm + AI libs
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
    tqdm \
    jupyter \
    tensorboard \
    scikit-learn

WORKDIR /workspace
EXPOSE 8888 8000
CMD ["bash"]
