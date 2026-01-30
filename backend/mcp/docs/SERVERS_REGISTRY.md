# 📡 MCP Servers Registry

Central registry of all available MCP servers in this workspace.

---

## ✅ Installed Servers

### 1. Net-Sentry (Security Audit)

**Status**: ✅ Ready to use
**Location**: `~/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry`
**Type**: Security audit, network scanning

#### Tools Available:
- `scan_network(target, scan_type)` - Network scanning with nmap
- `scan_web_vulns(target, port)` - Web vulnerability scanning with Nikto
- `whois_lookup(domain)` - Domain WHOIS information
- `dns_lookup(domain, record_type)` - DNS record lookup
- `read_rules()` - Read safety constraints

#### Quick Start:
```bash
cd ~/AI\ work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry
./run_mcp.sh
```

#### Docker:
```bash
docker build -t net-sentry:latest .
docker run -it --rm net-sentry:latest python3 sentry_mcp.py
```

#### Claude Integration:
```json
{
  "net-sentry": {
    "command": "bash",
    "args": ["-c", "cd '~/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry' && ./run_mcp.sh"]
  }
}
```

**Safety**: ✅ Restricted to local networks only

---

## 📋 Available Templates

### Template MCP Server

**Location**: `mcp/servers/template_mcp.py`
**Use for**: Creating new MCP servers

#### Includes:
- JSON-RPC 2.0 protocol implementation
- Sample tools (hello, add, list_items)
- Proper error handling
- Logging to stderr
- Documentation

#### Create New Server:
1. Copy `template_mcp.py` to new location
2. Add your tool methods
3. Register in `self.tools` dict
4. Test with: `python3 your_server.py`

---

## 🚀 Coming Soon (Planned)

### Potential MCP Servers to Create:

1. **File Operations** - Safe file read/write/search
2. **Database Tools** - Query databases, execute schemas
3. **API Client** - Make HTTP requests, test APIs
4. **Code Analysis** - Static analysis, linting
5. **Data Processing** - CSV, JSON, YAML parsing
6. **Container Management** - Docker/K8s operations
7. **Git Tools** - Repository operations
8. **System Monitor** - Process, disk, memory stats
9. **Package Manager** - Install/update packages
10. **Documentation Generator** - Auto-generate docs

---

## 🔧 How to Add New Servers

### Step 1: Create Directory
```bash
mkdir -p ~/AI\ work/anon/mcp/servers/my-new-server
cd ~/AI\ work/anon/mcp/servers/my-new-server
```

### Step 2: Create Files

**my_server.py** (MCP implementation):
```python
#!/usr/bin/env python3
# Copy from template_mcp.py and customize
import json, sys, logging

class MyServer:
    def __init__(self):
        self.tools = {
            "my_tool": self.my_tool,
        }
    
    def my_tool(self, param: str) -> str:
        """Description"""
        return f"Result: {param}"
    
    def handle_request(self, request):
        # ... JSON-RPC handling ...
        pass
    
    def run(self):
        # ... main loop ...
        pass

if __name__ == "__main__":
    MyServer().run()
```

**Dockerfile**:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY my_server.py .
ENTRYPOINT ["python3", "my_server.py"]
```

**requirements.txt**:
```
requests
# ... your dependencies
```

### Step 3: Test Locally
```bash
python3 my_server.py
```

### Step 4: Add to Claude Config
```json
{
  "my-server": {
    "command": "python3",
    "args": ["/home/anon/AI work/anon/mcp/servers/my-new-server/my_server.py"]
  }
}
```

### Step 5: Add Docker Support (Optional)
```bash
docker build -t my-server:latest .
docker run -it --rm my-server:latest
```

### Step 6: Register in This File
Add entry to registry above.

---

## 📊 Server Comparison

| Server | Type | Tools | Status | Docker | Docs |
|--------|------|-------|--------|--------|------|
| Net-Sentry | Security | 5 | ✅ Ready | ✅ Yes | ✅ Full |
| Template | Example | 3 | 📚 Template | - | ✅ Yes |

---

## 🧪 Testing Servers

### Manual Test
```python
import json, subprocess

proc = subprocess.Popen(
    ["python3", "my_server.py"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True
)

request = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
proc.stdin.write(json.dumps(request) + '\n')
proc.stdin.flush()

response = json.loads(proc.stdout.readline())
print(response)
```

### With Test Script
```bash
cd mcp
python3 test_net_sentry.py
```

---

## 🔐 Security Considerations

### Per-Server Rules:
- **Net-Sentry**: Local networks only (no external IPs)
- **File Operations** (future): Restrict to safe directories
- **API Client** (future): Whitelist allowed domains
- **System Monitor** (future): Read-only access

### General Guidelines:
1. Always validate/sanitize inputs
2. Run sensitive tools in containers
3. Log all operations
4. Implement rate limiting if needed
5. Use environment variables for secrets
6. Document all safety constraints

---

## 📚 References

- **MCP Spec**: https://modelcontextprotocol.io
- **Claude Desktop**: https://support.anthropic.com/en/articles/8784594
- **Docker**: https://docs.docker.com/
- **Python Subprocess**: https://docs.python.org/3/library/subprocess.html

---

## Quick Reference

```bash
# List all servers
ls -la mcp/servers/
ls -la projects/tools/Nexus_Connector/mcp/servers/net-sentry/

# Test net-sentry
cd projects/tools/Nexus_Connector/mcp/servers/net-sentry && ./run_mcp.sh

# Build Docker image
cd mcp/servers/my-server && docker build -t my-server:latest .

# Run all servers (docker-compose)
docker-compose -f docker-compose.yml up -d

# View Claude config
cat ~/.config/Claude/claude_desktop_config.json

# Add to Claude config
# 1. Locate the file (path depends on OS)
# 2. Edit and add mcpServers entry
# 3. Restart Claude Desktop
```

---

**Last Updated**: 2025-12-10
**Maintainer**: AI Workspace

