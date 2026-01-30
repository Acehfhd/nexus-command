# 🛡️ Net-Sentry: AI Agent Workspace & Rules

**ATTENTION AGENT:**
Before executing any network commands, you MUST execute `read_rules` (or read this file) to understand your constraints.

---

## 🚫 CRITICAL SAFETY RULES (DO NOT VIOLATE)
1.  **Scope Limitation:** You may ONLY scan the local network subnet (typically `192.168.x.x` or `10.x.x.x`) and the Host Gateway (`host.docker.internal` or gateway IP).
2.  **No External Scanning:** DO NOT scan public IP addresses or government/military/corporate infrastructure.
3.  **No Exploitation:** PROHIBITED to execute exploits, reverse shells, or denial-of-service attacks. This is an AUDIT tool, not a weapon.
4.  **Host Isolation:** You are in a Docker container. Do NOT attempt to break out or mount the host filesystem unless explicitly permitted.
5.  **Windows Drive:** Using `os` tools, NEVER attempt to access/mount `/dev/nvme0n1` (Windows Drive).

---

## 🛠️ Installed Tools Capability
This container is equipped with the following Kali Linux tools:

### 1. Network Scanning
-   **Nmap (`nmap`)**: The standard for network discovery.
    -   *Use Case:* Finding open ports, service versions.
    -   *Safe Command:* `nmap -F -sV <target>`

### 2. Reconnaissance
-   **Whois (`whois`)**: Domain registration data.
    -   *Use Case:* Identifying domain owners.
-   **Dig (`dig` / `dnsutils`)**: DNS record querying.
    -   *Use Case:* Checking `A`, `MX`, `TXT` records.

### 3. Vulnerability Scanning
-   **Nmap Scripts (`--script vuln`)**: Checks for CVEs.
-   **Nikto (`nikto`)**: Web server vulnerability scanner.
    -   *Use Case:* Finding dangerous files/configs on HTTP services.

### 4. Connectivity
-   **Ping (`ping`)**: basic reachability.
-   **IP Route (`ip`)**: Interface inspection.

---

## 🤖 MCP Server Interface
You interact with this system via the **Model Context Protocol (MCP)**.
Available Tools:
-   `scan_network(target, scan_type)`: Wraps Safe Nmap. Types: `quick`, `full`, `subnet`, `vuln`.
-   `scan_web_vulns(target, port)`: Wraps Nikto.
-   `whois_lookup(domain)`: Wraps Whois.
-   `dns_lookup(domain)`: Wraps Dig.
-   `read_rules()`: Returns this text content.

---
**VERIFIED & CLEAN ENVIRONMENT**
This container is built from `kalilinux/kali-rolling`.
Status: **ACTIVE**
