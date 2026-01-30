#!/bin/bash

# Build if needed
# docker build -t net-sentry . > /dev/null 2>&1

# Run the container in interactive mode to hook up Stdin/Stdout
# This allows the Agent (Claude/Ollama) to talk to the python script inside.
# --rm: Cleanup after exit
# --network host: To verify host network
docker run --rm -i \
    --network host \
    --cap-add=NET_ADMIN \
    --cap-add=NET_RAW \
    net-sentry
