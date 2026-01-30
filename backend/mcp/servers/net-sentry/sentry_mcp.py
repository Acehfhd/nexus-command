import sys
import json
import subprocess
import logging

# Configure logging to stderr so it doesn't mess up JSON-RPC on stdout
logging.basicConfig(stream=sys.stderr, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class MCPServer:
    def __init__(self):
        self.tools = {
            "scan_network": self.scan_network,
            "scan_web_vulns": self.scan_web_vulns,
            "whois_lookup": self.whois_lookup,
            "dns_lookup": self.dns_lookup
        }

    def scan_network(self, target: str, scan_type: str = "quick") -> str:
        """
        Runs a network scan using Nmap.
        Args:
            target: IP address or hostname to scan.
            scan_type: 'quick', 'full', 'subnet', or 'vuln' (Script scan).
        """
        logging.info(f"Running nmap scan on {target} ({scan_type})")
        cmd = ["nmap", target]
        if scan_type == "quick":
            cmd.extend(["-F", "-sV"])
        elif scan_type == "full":
            cmd.extend(["-p-", "-A"])
        elif scan_type == "subnet":
            cmd.extend(["-sn"])
        elif scan_type == "vuln":
            cmd.extend(["-F", "--script", "vuln"])
            
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            return f"Error running nmap: {e.stderr}"

    def scan_web_vulns(self, target: str, port: str = "80") -> str:
        """
        Runs Nikto web vulnerability scanner.
        Args:
            target: Host to scan.
            port: Port number.
        """
        logging.info(f"Running nikto on {target}:{port}")
        # -h: host, -T: Tuning (x for standard), -maxtime: limit
        cmd = ["nikto", "-h", target, "-p", port, "-maxtime", "60s"]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            # Nikto output can be verbose, return stdout
            return result.stdout
        except Exception as e:
            return f"Error running nikto: {str(e)}"

    def whois_lookup(self, domain: str) -> str:
        """
        Performs a WHOIS lookup for a domain.
        Args:
            domain: The domain name to query.
        """
        logging.info(f"Running whois on {domain}")
        try:
            result = subprocess.run(["whois", domain], capture_output=True, text=True, timeout=10)
            return result.stdout
        except Exception as e:
            return f"Error running whois: {str(e)}"

    def dns_lookup(self, domain: str, record_type: str = "A") -> str:
        """
        Performs a DNS lookup using dig.
        Args:
            domain: The domain to query.
            record_type: The DNS record type (A, MX, TXT, etc).
        """
        logging.info(f"Running dig {record_type} on {domain}")
        try:
            result = subprocess.run(["dig", domain, record_type, "+short"], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            return f"Error running dig: {str(e)}"

    def handle_request(self, request):
        """Matches JSON-RPC request to tool."""
        try:
            if "method" not in request:
                return None
            
            method = request["method"]
            
            # 1. Initialize
            if method == "initialize":
                return {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "protocolVersion": "2024-11-05", # Draft version
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "net-sentry",
                            "version": "1.0.0"
                        }
                    }
                }

            # 2. List Tools
            if method == "tools/list":
                return {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "tools": [
                            {
                                "name": "scan_network",
                                "description": "Scan a target IP or Network using Nmap.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "target": {"type": "string", "description": "IP or Hostname"},
                                        "scan_type": {"type": "string", "enum": ["quick", "full", "subnet"], "default": "quick"}
                                    },
                                    "required": ["target"]
                                }
                            },
                            {
                                "name": "whois_lookup",
                                "description": "Get domain registration info via Whois.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "domain": {"type": "string"}
                                    },
                                    "required": ["domain"]
                                }
                            },
                            {
                                "name": "dns_lookup",
                                "description": "Get DNS records via Dig.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "domain": {"type": "string"},
                                        "record_type": {"type": "string", "default": "A"}
                                    },
                                    "required": ["domain"]
                                }
                            },
                            {
                                "name": "scan_web_vulns",
                                "description": "Scan a web server for known vulnerabilities using Nikto.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "target": {"type": "string", "description": "IP or Hostname (e.g., localhost)"},
                                        "port": {"type": "string", "default": "80"}
                                    },
                                    "required": ["target"]
                                }
                            },
                            {
                                "name": "read_rules",
                                "description": "Read the safety rules and tool documentation for this environment.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {},
                                    "required": []
                                }
                            }
                        ]
                    }
                }

            # 3. Call Tool
            if method == "tools/call":
                params = request.get("params", {})
                tool_name = params.get("name")
                args = params.get("arguments", {})
                
                content = ""
                if tool_name == "read_rules":
                    try:
                        with open("/app/TOOLS_AND_RULES.md", "r") as f:
                            content = f.read()
                    except Exception:
                        content = "Error: Rules file not found."
                elif tool_name in self.tools:
                    content = self.tools[tool_name](**args)
                else:
                    raise Exception(f"Tool {tool_name} not found")

                return {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": content
                            }
                        ]
                    }
                }

        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {
                    "code": -32603,
                    "message": str(e)
                }
            }
        
        return None

    def run(self):
        """Main loop reading stdin."""
        logging.info("Net-Sentry MCP Server Started")
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                
                request = json.loads(line)
                response = self.handle_request(request)
                
                if response:
                    print(json.dumps(response), flush=True)
                    
            except json.JSONDecodeError:
                continue
            except Exception as e:
                logging.error(f"Fatal error: {e}")
                break

if __name__ == "__main__":
    server = MCPServer()
    server.run()
