#!/bin/bash
set -e

echo "🚀 Starting MCP Servers with Docker..."
echo "======================================"
echo ""

cd "$(dirname "$0")"

# Build images
echo "🔨 Building MCP server images..."
docker compose build

# Start services
echo "🐳 Starting containers..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 3

# Check status
echo ""
echo "✅ MCP Servers Started!"
echo ""
echo "📡 Available Services:"
echo "   - net-sentry-mcp: http://localhost:8000"
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "🧪 Testing net-sentry server..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✓ net-sentry is responding"
else
    echo "⚠ net-sentry may still be starting up..."
fi

echo ""
echo "💡 Use './stop_mcp_servers.sh' to stop all servers"
echo "💡 Use 'docker compose logs -f' to view logs"
