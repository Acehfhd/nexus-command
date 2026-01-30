#!/bin/bash
# ==========================================
# NEXUS AUTH SETUP HELPER
# Generates config files for Gemini & OpenCode
# ==========================================

mkdir -p ~/.gemini
mkdir -p ~/.opencode

echo "1. Setting up Gemini CLI Config..."
# Check if API Key is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Enter your Gemini API Key (or press Enter to skip if using Vertex):"
    read -r API_KEY
    if [ ! -z "$API_KEY" ]; then
        # Create settings.json if it doesn't exist
        if [ ! -f ~/.gemini/settings.json ]; then
            echo "{ \"geminiApiKey\": \"$API_KEY\" }" > ~/.gemini/settings.json
            echo "✅ Created ~/.gemini/settings.json"
        else
            echo "⚠️  ~/.gemini/settings.json already exists. Skipping overwrite."
        fi
    fi
else
    echo "✅ GEMINI_API_KEY env var found."
fi

echo ""
echo "2. Setting up OpenCode Config..."
echo "To login to OpenCode, run this command on your host:"
echo "opencode login"
echo ""
echo "Done! Restart the Nexus MCP container to apply changes:"
echo "docker compose -f docker-compose.pods.yml -p nexus-mcp restart mcp"
