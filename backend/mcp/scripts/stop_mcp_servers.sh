#!/bin/bash
set -e

echo "🛑 Stopping MCP Servers..."
echo "=========================="
echo ""

cd "$(dirname "$0")"

docker compose down

echo "✅ MCP Servers Stopped"
echo ""
echo "💡 Use './start_mcp_servers.sh' to start them again"
