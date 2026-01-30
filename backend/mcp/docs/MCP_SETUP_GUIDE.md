# 🔌 Model Context Protocol (MCP) - Complete Setup Guide

## Overview

MCP (Model Context Protocol) allows AI assistants like Claude to safely access tools and resources. You have:
- **Net-Sentry**: Security audit MCP server (network scanning, domain info, DNS checks)
- **Docker**: Already installed, can run MCP servers in containers
- **Framework**: Ready to add more servers (file ops, databases, APIs, etc.)

---

## Quick Start

### Option 1: Run Net-Sentry Directly (Recommended for Testing)

```bash
cd ~/AI\ work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry
./run_mcp.sh
```

This starts an MCP server on stdio. It will wait for JSON-RPC requests.

### Option 2: Run Multiple MCP Servers (Production)

See "Advanced Setup" section below.

---

## Net-Sentry MCP Server

### What It Does
- **Network Scanning**: Find open ports, services, vulnerabilities
- **Web Vulnerability Scanning**: Identify dangerous configs/files
- **Domain Lookup**: WHOIS and DNS queries
- **Local Network Only**: Safely restricted to local/internal networks

### Available Tools

```json
{
  "scan_network": {
    "params": {
      "target": "string (IP or hostname)",
      "scan_type": "quick|full|subnet|vuln"
    },
    "description": "Run nmap scan"
  },
  "scan_web_vulns": {
    "params": {
      "target": "string (hostname)",
      "port": "string (port number)"
    },
    "description": "Run Nikto web vulnerability scan"
  },
  "whois_lookup": {
    "params": {
      "domain": "string"
    },
    "description": "WHOIS domain lookup"
  },
  "dns_lookup": {
    "params": {
      "domain": "string",
      "record_type": "A|MX|TXT|NS|CNAME"
    },
    "description": "DNS record lookup using dig"
  },
  "read_rules": {
    "params": {},
    "description": "Read safety rules and constraints"
  }
}
```

### Safety Rules
✅ **ALLOWED:**
- Scanning `localhost`
- Scanning `10.x.x.x` (private network)
- Scanning `192.168.x.x` (private network)
- Scanning `host.docker.internal`

❌ **PROHIBITED:**
- Public IP addresses
- Government/military/corporate infrastructure
- Exploitation or reverse shells
- Denial-of-service attacks

---

## Claude Desktop Integration

### Step 1: Install Claude Desktop
- Download from: https://claude.ai/desktop
- Install and launch

### Step 2: Configure MCP Servers

Locate Claude's config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Step 3: Add MCP Server Configuration

Create or edit `claude_desktop_config.json`:

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

### Step 4: Restart Claude Desktop

Close and reopen Claude. You should see the MCP server indicator.

---

## Docker MCP Servers

### Running Net-Sentry in Docker

The net-sentry already has a Dockerfile. To run it via Docker:

```bash
cd ~/AI\ work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry

# Build image
docker build -t net-sentry-mcp:latest .

# Run container
docker run -it --rm net-sentry-mcp:latest python3 sentry_mcp.py
```

### Docker-Based Claude Config

For Docker MCP servers, use this config format:

```json
{
  "mcpServers": {
    "net-sentry": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "net-sentry-mcp:latest",
        "python3",
        "sentry_mcp.py"
      ]
    }
  }
}
```

---

## Creating New MCP Servers

### Template: Simple MCP Server

```python
import json
import sys
import logging

logging.basicConfig(stream=sys.stderr, level=logging.INFO)

class MyMCPServer:
    def __init__(self):
        self.tools = {
            "my_tool": self.my_tool,
        }

    def my_tool(self, param1: str, param2: int) -> str:
        """Description of what this tool does"""
        return f"Result: {param1} and {param2}"

    def handle_request(self, request):
        method = request.get("method")
        params = request.get("params", {})
        
        if method == "tools/list":
            return {
                "tools": [
                    {
                        "name": name,
                        "description": func.__doc__,
                        "input_schema": {"type": "object"}
                    }
                    for name, func in self.tools.items()
                ]
            }
        
        if method == "tool/call":
            tool_name = params.get("name")
            args = params.get("arguments", {})
            
            if tool_name in self.tools:
                result = self.tools[tool_name](**args)
                return {"content": [{"type": "text", "text": result}]}
            
            return {"error": f"Tool {tool_name} not found"}

server = MyMCPServer()

while True:
    try:
        line = sys.stdin.readline()
        if not line:
            break
        
        request = json.loads(line)
        response = server.handle_request(request)
        print(json.dumps(response))
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
```

### Template: Dockerfile for Custom MCP Server

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY my_mcp_server.py .

ENTRYPOINT ["python3", "my_mcp_server.py"]
```

---

## Advanced Setup: Multi-Server Configuration

### docker-compose.yml for MCP Stack

```yaml
version: '3.8'

services:
  net-sentry:
    build: ./projects/tools/Nexus_Connector/mcp/servers/net-sentry
    stdin_open: true
    tty: true
    networks:
      - mcp-network

  my-custom-server:
    build: ./my-servers/custom-mcp
    stdin_open: true
    tty: true
    networks:
      - mcp-network

networks:
  mcp-network:
    driver: bridge
```

### Launch Multiple Servers

```bash
docker-compose -f ~/AI\ work/anon/mcp/docker-compose.yml up -d
```

---

## Testing MCP Servers

### Manual Testing (JSON-RPC)

1. Start the server:
```bash
./run_mcp.sh
```

2. In another terminal, send a request:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | nc localhost 3000
```

Or use a test script:

```python
import subprocess
import json

# Start server
proc = subprocess.Popen(
    ['python3', 'sentry_mcp.py'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# List tools
request = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
proc.stdin.write(json.dumps(request) + '\n')
proc.stdin.flush()

response = proc.stdout.readline()
print(json.loads(response))

proc.terminate()
```

---

## Troubleshooting

### Server Won't Start
```bash
# Check Python environment
python3 --version

# Check dependencies
pip list | grep -E "mcp|json"

# Run with debug output
python3 -u sentry_mcp.py
```

### Claude Doesn't See Server
1. Check config file path is correct
2. Verify command/args in JSON
3. Try running command manually
4. Restart Claude Desktop completely

### Tools Not Available
1. Check server is running: `ps aux | grep mcp`
2. Check logs: `tail -f ~/.config/Claude/logs/`
3. Verify JSON format in config

---

## File Structure

```
mcp/
├── MCP_SETUP_GUIDE.md          ← You are here
├── README.md                   ← Overview
├── configs/                    ← Configuration files
│   └── claude_desktop_config.json (to create)
├── servers/                    ← Custom MCP servers (to add)
│   └── example-server/
│       ├── Dockerfile
│       ├── server.py
│       └── requirements.txt
└── tools/                      ← Tool definitions

projects/tools/
└── net-sentry/                 ← Built-in MCP server
    ├── sentry_mcp.py
    ├── run_mcp.sh
    ├── Dockerfile
    └── TOOLS_AND_RULES.md
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Test net-sentry | `cd ~/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry && ./run_mcp.sh` |
| Build net-sentry Docker | `docker build -t net-sentry:latest .` |
| Run Docker version | `docker run -it --rm net-sentry:latest python3 sentry_mcp.py` |
| View Claude config | `cat ~/.config/Claude/claude_desktop_config.json` |
| Check MCP logs | `tail -f ~/.config/Claude/logs/mcp.log` |
| List active servers | `ps aux \| grep mcp` |

---

## Next Steps

1. **Test Net-Sentry**: Run `./run_mcp.sh` and verify it works
2. **Install Claude Desktop**: Download and install
3. **Configure Claude**: Add MCP server to config
4. **Create Custom Servers**: Build your own tools as needed
5. **Docker Integration**: Deploy MCP servers in containers

---

## Resources

- **MCP Spec**: https://modelcontextprotocol.io
- **Claude Integration**: https://support.anthropic.com/en/articles/8784594-claude-desktop
- **Kali Tools**: https://tools.kali.org/
- **Docker Docs**: https://docs.docker.com/

---

**Questions?** Check the specific server's README or TOOLS_AND_RULES.md file.

