import asyncio
import logging
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# 🔌 MCP CLIENT INTEGRATION
# Connects to Filesystem, Obsidian (Memory), and n8n servers.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp_client")

class NexusMCPClient:
    def __init__(self):
        self.sessions = {}

    async def connect_to_server(self, name: str, command: str, args: list):
        """Connect to a local MCP server via Stdio."""
        logger.info(f"🔗 Connecting to MCP Server: {name}")
        server_params = StdioServerParameters(command=command, args=args)
        
        # This is a simplified wrapper for Stdio connection
        # In actual use, we'd maintain these sessions
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                self.sessions[name] = session
                logger.info(f"✅ Connected to {name}")

    async def call_n8n_tool(self, tool_name: str, arguments: dict):
        """Call a tool on the n8n HTTP MCP server."""
        # For n8n HTTP MCP, we might use httpx instead of Stdio if it's purely HTTP
        import httpx
        url = "http://localhost:5678/mcp-server/http"
        logger.info(f"🌀 Calling n8n tool: {tool_name}")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json={
                    "method": "call_tool",
                    "params": {
                        "name": tool_name,
                        "arguments": arguments
                    }
                })
                return response.json()
        except Exception as e:
            logger.error(f"n8n MCP Error: {e}")
            return {"error": str(e)}

nexus_mcp = NexusMCPClient()
