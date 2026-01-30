# 🔌 Model Context Protocol (MCP)

This folder configures the tools that AI agents (Claude, Gemini, Ollama) can use.

## Structure
*   `servers/`: Source code for custom MCP servers.

*   `configs/`: Configuration files (e.g., `claude_desktop_config.json`).

## Installed Servers
1.  **Net-Sentry**: located in `../../projects/AI-Work/tools/net-sentry`.

### Option 2: Run Multiple MCP Servers (Production)

This uses Docker Compose to run **Net-Sentry** and **Obsidian** MCP servers together.

1. **Configure Environment:**
   Copy the example environment file and add your Obsidian API Key:
   ```bash
   cd ~/AI\ work/anon/mcp
   cp .env.example .env
   # Edit .env and paste your key from Obsidian -> Settings -> Local REST API
   nano .env
   ```
   > [!IMPORTANT]
   > **SECURITY WARNING:** Never commit `.env` to version control. It receives your secret API Key.
   > AI Agents should NOT attempt to read `.env` directly. Use environment variables injected at runtime.

2. **Start Servers:**
   ```bash
   ./start_mcp_servers.sh
   ```

3. **Connect Your Client:**
   - **Open WebUI**: Go to Admin -> Connections -> Add Connection.
     - Net-Sentry: `http://localhost:8000/sse` (if using MCPO) or via stdio config.
     - Obsidian: `http://localhost:8000` (via mcpo) or connect directly if using a tool wrapper.
   *Note: For direct MCP client connection (like Claude Desktop), see the config JSON below.*
