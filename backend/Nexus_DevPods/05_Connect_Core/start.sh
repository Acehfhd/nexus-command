#!/bin/bash

# Start LiteLLM in background
echo "Starting LiteLLM Bridge..."
litellm --model ollama/qwen3:8b --api_base http://nexus-ollama:11434 --port 4000 --debug &

# Start Dashboard (React/Vite) - Move to 8081 to avoid conflict with API
echo "Starting Nexus Dashboard (React) on port 8081..."
cd /workspace/tools/nexus/dashboard
npm install
npm run dev -- --host 0.0.0.0 --port 8081 &

# Start Nexus ADK Backend (FastAPI) on port 8080 (Mapped to host 8090)
cd /workspace/tools/Nexus_Connector/
echo "Starting Swarm Worker..."
python3 -m backend.swarm_worker &

echo "Starting Nexus ADK Backend..."
python3 -m backend.main
