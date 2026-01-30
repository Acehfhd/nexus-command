#!/usr/bin/env python3
"""
Template MCP Server - Copy this to create new MCP tools

Usage:
  python3 template_mcp.py    # Runs as stdio server
  
Add to Claude config:
  "my-server": {
    "command": "python3",
    "args": ["/path/to/template_mcp.py"]
  }
"""

import json
import sys
import logging
from typing import Any, Dict, List

# Configure logging to stderr (keeps stdout clean for MCP JSON-RPC)
logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TemplateMCPServer:
    """
    Example MCP Server with sample tools.
    
    Implement your own tools by:
    1. Adding methods to this class
    2. Registering them in self.tools
    3. Return string results
    """
    
    def __init__(self):
        """Initialize MCP server with available tools"""
        self.tools = {
            "hello": self.hello,
            "add": self.add,
            "list_items": self.list_items,
        }
        logger.info("Template MCP Server initialized")

    # ==================== TOOL IMPLEMENTATIONS ====================
    
    def hello(self, name: str = "World") -> str:
        """
        Simple greeting tool
        
        Args:
            name: Name to greet
            
        Returns:
            Greeting message
        """
        logger.info(f"Hello called with name={name}")
        return f"Hello, {name}! Welcome to the MCP server."

    def add(self, a: float, b: float) -> str:
        """
        Add two numbers
        
        Args:
            a: First number
            b: Second number
            
        Returns:
            Sum as string
        """
        result = a + b
        logger.info(f"Add: {a} + {b} = {result}")
        return f"{a} + {b} = {result}"

    def list_items(self, category: str = "default") -> str:
        """
        List items in a category
        
        Args:
            category: Category name
            
        Returns:
            List of items
        """
        items = {
            "default": ["item1", "item2", "item3"],
            "fruits": ["apple", "banana", "orange"],
            "colors": ["red", "blue", "green"],
        }
        result = items.get(category, items["default"])
        logger.info(f"Listed items for category={category}")
        return f"Items in '{category}': {', '.join(result)}"

    # ==================== MCP PROTOCOL HANDLERS ====================
    
    def _get_tool_schema(self, tool_name: str, tool_func) -> Dict[str, Any]:
        """Generate JSON schema for a tool from its docstring"""
        doc = tool_func.__doc__ or ""
        
        # Extract description (first line of docstring)
        description = doc.split('\n')[0].strip()
        
        # Basic schema - you can enhance this
        return {
            "type": "object",
            "properties": {},
            "required": []
        }

    def handle_tools_list(self) -> Dict[str, Any]:
        """Handle tools/list request"""
        logger.info("Listing available tools")
        tools = []
        
        for name, func in self.tools.items():
            doc = func.__doc__ or "No description"
            # Clean up docstring
            description = doc.split('\n')[0].strip()
            
            tools.append({
                "name": name,
                "description": description,
                "inputSchema": self._get_tool_schema(name, func)
            })
        
        return {
            "tools": tools
        }

    def handle_tool_call(self, name: str, arguments: Dict) -> Dict[str, Any]:
        """Handle tool/call request"""
        logger.info(f"Tool call: {name} with args {arguments}")
        
        if name not in self.tools:
            error_msg = f"Tool '{name}' not found. Available: {list(self.tools.keys())}"
            logger.error(error_msg)
            return {
                "content": [{"type": "text", "text": error_msg}],
                "isError": True
            }
        
        try:
            # Call the tool with provided arguments
            result = self.tools[name](**arguments)
            logger.info(f"Tool {name} returned: {result}")
            
            return {
                "content": [{"type": "text", "text": str(result)}]
            }
        except Exception as e:
            error_msg = f"Error calling {name}: {str(e)}"
            logger.exception(error_msg)
            return {
                "content": [{"type": "text", "text": error_msg}],
                "isError": True
            }

    def handle_request(self, request: Dict) -> Dict[str, Any]:
        """
        Handle JSON-RPC 2.0 request from MCP client
        
        Request format:
        {
          "jsonrpc": "2.0",
          "id": <number>,
          "method": "<method>",
          "params": <object>
        }
        """
        try:
            method = request.get("method")
            params = request.get("params", {})
            
            logger.info(f"Request: method={method}")
            
            # Route to appropriate handler
            if method == "tools/list":
                result = self.handle_tools_list()
            elif method == "tool/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                result = self.handle_tool_call(tool_name, arguments)
            else:
                result = {
                    "error": f"Unknown method: {method}",
                    "isError": True
                }
            
            return result
            
        except Exception as e:
            logger.exception("Unexpected error handling request")
            return {
                "error": str(e),
                "isError": True
            }

    # ==================== MAIN LOOP ====================
    
    def run(self):
        """Run the MCP server in stdio mode"""
        logger.info("Starting MCP server on stdio...")
        
        try:
            while True:
                try:
                    # Read JSON-RPC request from stdin
                    line = sys.stdin.readline()
                    if not line:
                        logger.info("EOF received, shutting down")
                        break
                    
                    # Parse request
                    request = json.loads(line)
                    logger.debug(f"Received: {request}")
                    
                    # Handle request
                    response = self.handle_request(request)
                    
                    # Add JSON-RPC metadata
                    response["jsonrpc"] = "2.0"
                    if "id" in request:
                        response["id"] = request["id"]
                    
                    # Send response
                    print(json.dumps(response), flush=True)
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON: {e}")
                    error_response = {
                        "jsonrpc": "2.0",
                        "error": f"Invalid JSON: {str(e)}"
                    }
                    print(json.dumps(error_response), flush=True)
                    
        except KeyboardInterrupt:
            logger.info("Interrupted by user")
        except Exception as e:
            logger.exception("Unexpected error in main loop")
            sys.exit(1)


if __name__ == "__main__":
    server = TemplateMCPServer()
    server.run()
