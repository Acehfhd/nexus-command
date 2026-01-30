#!/bin/bash
cd "$(dirname "$0")"

echo "🛑 Stopping GPU Dev Container..."
docker compose down
echo "✅ Container stopped."
