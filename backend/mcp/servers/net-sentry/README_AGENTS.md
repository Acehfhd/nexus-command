# 🤖 AI Agent Guide: Using Net-Sentry

**Location**: `~/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry`

## Overview
Net-Sentry is a **Security Audit Workspace** running inside a Kali Linux Docker container. It exposes safe, read-only tools for network verification.

## Capabilities
1.  **Network Scan**: `scan_network(target="localhost", scan_type="quick")`
2.  **Web Scan**: `scan_web_vulns(target="localhost", port="80")`
3.  **Domain Info**: `whois_lookup(domain="example.com")`
4.  **DNS Check**: `dns_lookup(domain="example.com")`

## Safety Rules
*   **Target Scope**: ONLY scan `localhost`, `10.x.x.x`, or `192.168.x.x`.
*   **Prohibited**: scanning public/external IPs.
*   **Read Rules First**: Always call `read_rules()` to verify constraints.

## How to Run
```bash
cd "/home/anon/AI work/anon/projects/tools/Nexus_Connector/mcp/servers/net-sentry"
./run_mcp.sh
```
*Note: This runs in interactive mode (Stdio) for MCP integration.*
