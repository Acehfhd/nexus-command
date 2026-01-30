# 🚀 MCP Quick Start - 5 Minutes

Get Model Context Protocol running with your AI assistants in 5 minutes.

---

## What is MCP?

MCP = Model Context Protocol. It lets AI assistants (Claude, Gemini, Ollama) safely use your tools.

**You have**:
- ✅ Docker installed (for running servers)
- ✅ Net-Sentry MCP server (network/security tools)
- ✅ Templates for building more servers

---

## 5-Minute Setup

### Step 1: Verify Net-Sentry Works (1 min)

```bash
cd ~/AI\ work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry
python3 sentry_mcp.py <<< '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Expected**: JSON response with list of 5 tools ✅

### Step 2: Install Claude Desktop (2 min)

- Go to: https://claude.ai/desktop
- Download and install
- Launch it

### Step 3: Configure Claude (1 min)

Find your Claude config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Replace entire contents with:

```json
{
  "mcpServers": {
    "net-sentry": {
      "command": "bash",
      "args": [
        "-c",
        "cd '/home/anon/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry' && ./run_mcp.sh"
      ]
    }
  }
}
```

### Step 4: Restart Claude (1 min)

- Close Claude completely
- Wait 3 seconds
- Reopen Claude
- Look for MCP server indicator in bottom-left corner

**Done! ✅**

---

## Test It Works

In Claude, ask:

> I have an MCP server available. Can you list the tools available?

Claude should respond with:
- scan_network
- scan_web_vulns
- whois_lookup
- dns_lookup
- read_rules

---

## What You Can Do Now

### Network Scanning
> Scan localhost for open ports and services

### Domain Lookup
> Get WHOIS information for example.com

### DNS Queries
> Look up the A records for google.com

### Web Vulnerability Scanning
> Check localhost:8080 for web vulnerabilities

### Safety Verification
> Read the rules for what I can and cannot scan

---

## Next Steps

### Create Custom MCP Servers

Copy template:
```bash
cp ~/AI\ work/anon/mcp/servers/template_mcp.py ~/AI\ work/anon/mcp/servers/my-server.py
```

Edit it:
- Add your tools as methods
- Register in `self.tools` dict
- Test: `python3 my-server.py`

Add to Claude:
```json
{
  "my-server": {
    "command": "python3",
    "args": ["/home/anon/AI work/anon/mcp/servers/my-server.py"]
  }
}
```

### Run in Docker

Build:
```bash
cd ~/AI\ work/anon/mcp/servers/my-server
docker build -t my-server:latest .
```

Update Claude config:
```json
{
  "my-server": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "my-server:latest", "python3", "my_server.py"]
  }
}
```

---

## Troubleshooting

### Claude doesn't see the server

1. Check config file path is correct
2. Verify JSON syntax is valid
3. Try running command manually in terminal
4. Check Claude logs: `tail -f ~/.config/Claude/logs/mcp.log`
5. Restart Claude completely

### Server throws errors

```bash
# Test locally first
cd ~/AI\ work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry
python3 sentry_mcp.py

# Send a request (in another terminal):
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | nc localhost 3000
```

### Tools don't work

1. Run: `read_rules` tool first (shows constraints)
2. Verify target is localhost or private IP (10.x.x.x, 192.168.x.x)
3. Check error message in Claude

---

## File Structure

```
mcp/
├── QUICK_START_MCP.md        ← You are here
├── MCP_SETUP_GUIDE.md        ← Full documentation
├── SERVERS_REGISTRY.md       ← List of all servers
├── configs/
│   └── claude_desktop_config.json  ← Claude config
├── servers/
│   └── template_mcp.py       ← Copy this to make new servers
└── test_net_sentry.py        ← Test script

projects/tools/Nexus_Connector/mcp/servers/net-sentry/    ← Actual MCP server
├── sentry_mcp.py
├── run_mcp.sh
└── Dockerfile
```

---

## Key Commands

| Task | Command |
|------|---------|
| Test net-sentry | `cd ~/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry && python3 sentry_mcp.py` |
| Find Claude config | See "Step 3" above |
| View current servers | `cat ~/.config/Claude/claude_desktop_config.json` |
| List MCP servers | `ls -la ~/AI\ work/anon/mcp/servers/` |
| Create new server | `cp ~/AI\ work/anon/mcp/servers/template_mcp.py ~/AI\ work/anon/mcp/servers/my-server.py` |
| Build Docker image | `docker build -t my-server:latest .` |

---

## Got Stuck?

1. **Read**: MCP_SETUP_GUIDE.md (comprehensive)
2. **Check**: SERVERS_REGISTRY.md (available tools)
3. **Run**: test_net_sentry.py (diagnostics)
4. **Review**: net-sentry/TOOLS_AND_RULES.md (constraints)

---

**Questions?** All docs are in ~/AI work/anon/projects/tools/Nexus_Connector/mcp/

**Ready to build something?** Copy template_mcp.py and start coding! 🚀

