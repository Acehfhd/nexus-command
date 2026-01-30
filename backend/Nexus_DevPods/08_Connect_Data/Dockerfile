# Connect Data Pod
# Lightweight Data Science (Jupyter, Pandas, Plotting) - No Heavy AI

FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive

# System tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Data Science Stack
RUN pip install --no-cache-dir \
    jupyterlab \
    notebook \
    pandas \
    numpy \
    matplotlib \
    seaborn \
    plotly \
    requests \
    python-dotenv

WORKDIR /workspace
CMD ["bash"]
