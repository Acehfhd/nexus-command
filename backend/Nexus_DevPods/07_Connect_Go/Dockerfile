# Connect Go Pod
# High-performance backend development (Go 1.22)

FROM golang:1.22-bullseye

ENV DEBIAN_FRONTEND=noninteractive

# System tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install common Go tools
RUN go install golang.org/x/tools/gopls@latest \
    && go install github.com/go-delve/delve/cmd/dlv@latest \
    && go install github.com/air-verse/air@latest

WORKDIR /workspace
CMD ["bash"]
