#!/usr/bin/env python3
"""
Quick test script for net-sentry MCP server

Run this to verify net-sentry is working and see example tool calls
"""

import subprocess
import json
import time
import sys


def test_net_sentry():
    """Test net-sentry MCP server"""
    
    print("=" * 60)
    print("Net-Sentry MCP Server Test")
    print("=" * 60)
    print()
    
    # Start net-sentry server
    print("📡 Starting net-sentry server...")
    proc = subprocess.Popen(
        [
            'bash', '-c',
            'cd /home/anon/AI\ work/anon/projects/tools/net-sentry && ./run_mcp.sh'
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    time.sleep(2)  # Give server time to start
    print("✓ Server started\n")
    
    try:
        # Test 1: List available tools
        print("TEST 1: List Available Tools")
        print("-" * 40)
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }
        
        proc.stdin.write(json.dumps(request) + '\n')
        proc.stdin.flush()
        
        response_line = proc.stdout.readline()
        if response_line:
            response = json.loads(response_line)
            if "tools" in response:
                print(f"Found {len(response['tools'])} tools:")
                for tool in response['tools']:
                    print(f"  • {tool['name']}: {tool['description']}")
            else:
                print("Response:", json.dumps(response, indent=2))
        print()
        
        # Test 2: Call DNS lookup tool
        print("TEST 2: DNS Lookup (example.com)")
        print("-" * 40)
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tool/call",
            "params": {
                "name": "dns_lookup",
                "arguments": {
                    "domain": "example.com",
                    "record_type": "A"
                }
            }
        }
        
        proc.stdin.write(json.dumps(request) + '\n')
        proc.stdin.flush()
        
        response_line = proc.stdout.readline()
        if response_line:
            response = json.loads(response_line)
            if "content" in response:
                content = response["content"][0]["text"]
                # Show first 500 chars
                preview = content[:500] + "..." if len(content) > 500 else content
                print("Result:")
                print(preview)
            else:
                print("Response:", json.dumps(response, indent=2))
        print()
        
        # Test 3: Read rules
        print("TEST 3: Read Safety Rules")
        print("-" * 40)
        request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tool/call",
            "params": {
                "name": "read_rules",
                "arguments": {}
            }
        }
        
        proc.stdin.write(json.dumps(request) + '\n')
        proc.stdin.flush()
        
        response_line = proc.stdout.readline()
        if response_line:
            response = json.loads(response_line)
            if "content" in response:
                content = response["content"][0]["text"]
                # Show first 300 chars
                preview = content[:300] + "..." if len(content) > 300 else content
                print("Rules:")
                print(preview)
            else:
                print("Response:", json.dumps(response, indent=2))
        print()
        
        print("=" * 60)
        print("✓ All tests completed!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Add net-sentry to Claude Desktop config")
        print("2. Run: ./run_mcp.sh from net-sentry folder")
        print("3. Configure in Claude: ~/.config/Claude/claude_desktop_config.json")
        print()
        
    finally:
        # Cleanup
        print("Shutting down server...")
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        print("✓ Done")


if __name__ == "__main__":
    try:
        test_net_sentry()
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
