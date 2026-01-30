#!/bin/bash
set -e

# Ensure we are in the script directory
cd "$(dirname "$0")"

# Check for .env file in parent directory or current directory
if [ -f "../../.env" ]; then
    export $(grep -v '^#' ../../.env | xargs)
elif [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: No .env file found with OBSIDIAN_API_KEY"
    echo "Please create ../../.env or .env with your key."
    exit 1
fi

echo "🚀 Starting Obsidian MCP Server..."
docker compose up -d
echo "✅ Obsidian MCP is running!"
