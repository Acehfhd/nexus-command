# Connect WebApp Pod
# Web + Mobile development: Node.js, React, Flask

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    wget \
    software-properties-common \
    x11vnc \
    fluxbox \
    xvfb \
    novnc \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Python 3.12 (for Flask backends)
RUN add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update && apt-get install -y \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Virtual Environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3.12 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Python web frameworks
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 \
    && pip install --no-cache-dir \
    flask \
    fastapi \
    uvicorn \
    requests \
    "numpy<2"

# Global npm packages (React, Next.js, Appium)
RUN npm install -g pnpm yarn create-react-app create-next-app appium

# Playwright & Browsers (for full browser control)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN pip install playwright \
    && playwright install --with-deps chromium firefox webkit

# Appium Python Client (for phone control)
RUN pip install Appium-Python-Client

WORKDIR /workspace
EXPOSE 3000 5000 8000 8080
CMD ["bash"]
