# 🔌 MCP (Model Context Protocol) - Complete Setup

**Status**: ✅ Ready to use | **Last Updated**: Dec 10, 2025

---

## What is MCP?

Model Context Protocol allows Claude, Ollama, Gemini and other AI assistants to safely access your custom tools and services.

**In this workspace**:
- ✅ Net-Sentry MCP server (network scanning, domain info, DNS)
- ✅ Docker support (run servers in containers)
- ✅ Templates (create your own servers)
- ✅ Claude Desktop integration (ready to configure)

---

## 🚀 Quick Start (Choose Your Path)

### Path 1: Just Want to Test It? (5 min)
👉 **Read**: `QUICK_START_MCP.md`
- Verify net-sentry works
- Install Claude Desktop
- Configure and test

### Path 2: Want Full Understanding? (15 min)
👉 **Read**: `MCP_SETUP_GUIDE.md`
- Architecture overview
- All tools and capabilities
- Claude integration details
- Docker deployment

### Path 3: Want to Build Servers? (30 min)
👉 **Read**: `SERVERS_REGISTRY.md` then `servers/template_mcp.py`
- Available servers
- How to create custom ones
- Docker containerization
- Testing procedures

---

## 📚 Documentation Map

| File | Purpose | Time | For Whom |
|------|---------|------|----------|
| `QUICK_START_MCP.md` | Get running in 5 minutes | 5 min | Everyone - start here! |
| `MCP_SETUP_GUIDE.md` | Comprehensive guide | 15 min | Anyone wanting full details |
| `SERVERS_REGISTRY.md` | List of servers & how to add | 10 min | Developers building tools |
| `README.md` | Original overview | - | Reference |
| This file (`INDEX.md`) | Navigation guide | - | You are here |

---

## 🛠️ Available Tools

### Net-Sentry (Pre-installed)
Location: `~/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry/`

**5 Tools**:
- `scan_network()` - Nmap scanning (quick, full, subnet, vuln)
- `scan_web_vulns()` - Nikto web vulnerability scanning
- `whois_lookup()` - Domain WHOIS information
- `dns_lookup()` - DNS record queries
- `read_rules()` - Safety constraints

**Safety**: ✅ Restricted to local networks only (192.168.x.x, 10.x.x.x)

---

## 📂 File Structure

```
Your Workspace:
├── mcp/                              ← You are here
│   ├── INDEX.md                      ← Navigation guide
│   ├── QUICK_START_MCP.md            ← Start here!
│   ├── MCP_SETUP_GUIDE.md            ← Full guide
│   ├── SERVERS_REGISTRY.md           ← Available servers
│   ├── test_net_sentry.py            ← Test script
│   ├── configs/
│   │   └── claude_desktop_config.json ← Copy to Claude
│   ├── servers/
│   │   └── template_mcp.py           ← Copy to create new
│   └── tools/                        ← Tool definitions
│
├── projects/tools/Nexus_Connector/mcp/servers/net-sentry/        ← Pre-built MCP server
│   ├── sentry_mcp.py
│   ├── Dockerfile
│   └── TOOLS_AND_RULES.md
│
└── docker-compose.yml            ← Multi-server launcher
```

---

## ⚡ Quick Commands

```bash
# Test net-sentry locally
cd ~/AI\ work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry
python3 sentry_mcp.py

# View Claude config location (Linux)
cat ~/.config/Claude/claude_desktop_config.json

# Start all MCP servers with Docker
docker-compose -f ~/AI\ work/anon/docker-compose.yml up -d

# Create new MCP server
cp ~/AI\ work/anon/mcp/servers/template_mcp.py \
   ~/AI\ work/anon/mcp/servers/my-server.py

# Test your MCP server
python3 ~/AI\ work/anon/mcp/servers/my-server.py
```

---

## 🎯 Typical Workflow

### As a User:
1. Read `QUICK_START_MCP.md` (5 min)
2. Install Claude Desktop
3. Copy Claude config
4. Restart Claude
5. Use tools in Claude: "Can you scan localhost?"

### As a Developer:
1. Read `SERVERS_REGISTRY.md` (understand existing servers)
2. Copy `template_mcp.py`
3. Add your tools as methods
4. Test locally: `python3 my-server.py`
5. Add to Claude config
6. (Optional) Containerize with Docker

### With Docker:
1. Create Dockerfile for your server
2. Add service to `docker-compose.yml`
3. Run: `docker-compose -f docker-compose.yml up -d`
4. Configure Claude to use Docker command

---

## 🔐 Safety & Constraints

### Net-Sentry Rules:
✅ **ALLOWED**:
- Localhost scanning
- Private network (10.0.0.0/8, 192.168.0.0/16)
- Docker internal addresses

❌ **PROHIBITED**:
- Public IPs
- Government/military/corporate infrastructure
- Exploitation or attacks
- Filesystem access

### Custom Servers:
- Implement your own validation
- Log all operations
- Use environment variables for secrets
- Run in containers for isolation

---

## 💡 Common Questions

**Q: How do I add a new MCP server?**
A: Copy `template_mcp.py`, add your tools, test it, add to Claude config.

**Q: Can I run multiple servers at once?**
A: Yes! Use `docker-compose.yml` to run all servers together.

**Q: What if Claude doesn't see my server?**
A: Check config path, JSON syntax, and manually run the command in terminal.

**Q: Can I use this without Claude Desktop?**
A: Yes! MCP servers are JSON-RPC services. Any MCP client can use them.

**Q: How do I deploy to production?**
A: Use Docker to containerize and run on a server. Update your Claude config to use the Docker image.

---

## 🔗 Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **Claude Desktop Help**: https://support.anthropic.com/en/articles/8784594
- **Docker Docs**: https://docs.docker.com/
- **Kali Tools**: https://tools.kali.org/

---

## ✅ Next Steps

Choose one:

- **[ ] Path 1**: Read `QUICK_START_MCP.md` and set up Claude
- **[ ] Path 2**: Read `MCP_SETUP_GUIDE.md` for full understanding  
- **[ ] Path 3**: Read `SERVERS_REGISTRY.md` and create a custom server
- **[ ] Path 4**: Deploy with `docker-compose.yml`

---

## 🎉 You're All Set!

Everything is ready to go:
- ✅ Net-sentry MCP server (fully functional)
- ✅ Documentation (comprehensive guides)
- ✅ Templates (copy to create your own)
- ✅ Docker (containerized deployment)
- ✅ Claude config (pre-created)

**Start with**: `QUICK_START_MCP.md` 👉

---

**Questions?** Check the relevant documentation file or the net-sentry TOOLS_AND_RULES.md.

**Ready to build?** Copy template_mcp.py and start coding! 🚀

