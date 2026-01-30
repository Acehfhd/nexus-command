
import os
import json
import logging
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-mcp")

app = FastAPI()

# Configuration (using environment variables)
SEARXNG_URL = os.getenv("SEARXNG_URL", "http://searxng:8080")
N8N_URL = os.getenv("N8N_URL", "http://nexus-n8n:5678/webhook")
VAULT_PATH = os.getenv("VAULT_PATH", "/vault")

# Workflow Template Paths (Mapped inside container)
WAN_TEMPLATE = os.path.join(VAULT_PATH, "projects/tools/nexus/comfyui/data/wan_2.2_workflow_api.json")
JUGGERNAUT_TEMPLATE = os.path.join(VAULT_PATH, "projects/tools/nexus/comfyui/data/juggernaut_xl_workflow_api.json")

class ToolCall(BaseModel):
    name: str
    arguments: dict

@app.get("/")
def health():
    return {"status": "ok", "service": "Nexus Unified MCP"}

@app.post("/mcp/call")
def call_tool(tool: ToolCall):
    logger.info(f"MCP Call: {tool.name}")
    try:
        if tool.name == "search_web":
            return {"content": search_web(tool.arguments.get("query", ""))}
        elif tool.name == "read_obsidian":
            return {"content": read_obsidian(tool.arguments.get("filename", ""))}
        elif tool.name == "trigger_n8n":
            return {"content": trigger_n8n(tool.arguments.get("intent", ""))}
        elif tool.name == "generate_video":
            return {"content": generate_media("video", tool.arguments.get("prompt", ""))}
        elif tool.name == "generate_image":
            return {"content": generate_media("image", tool.arguments.get("prompt", ""))}
        elif tool.name == "agent_chat":
            return {"content": agent_chat(tool.arguments.get("agent", ""), tool.arguments.get("prompt", ""), tool.arguments.get("model", ""))}
        elif tool.name == "execute_command":
            return {"content": execute_command(tool.arguments.get("intent", ""))}
        else:
            raise HTTPException(status_code=404, detail="Tool not found")
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e)}

import subprocess

def execute_command(intent: str) -> str:
    try:
        registry_path = os.path.join(VAULT_PATH, "projects/tools/nexus/nexus_command_registry.json")
        if not os.path.exists(registry_path):
            return "Registry file not found."
            
        with open(registry_path, "r") as f:
            registry = json.load(f)
            
        # Find matching intent
        command_to_run = None
        for cmd in registry.get("commands", []):
            if cmd["intent"].lower() == intent.lower() or intent.lower() in [p.lower() for p in cmd.get("phrase", [])]:
                command_to_run = cmd["command"]
                break
                
        if not command_to_run:
            return f"No command found for intent: {intent}"
            
        logger.info(f"Executing: {command_to_run}")
        result = subprocess.run(command_to_run, shell=True, capture_output=True, text=True)
        
        output = result.stdout if result.stdout else result.stderr
        return f"Ran command for '{intent}'. Output: {output[:500]}"
    except Exception as e:
        return f"Execution error: {e}"

def search_web(query: str) -> str:
    try:
        resp = requests.get(f"{SEARXNG_URL}/search", params={"q": query, "format": "json"}, timeout=10)
        data = resp.json()
        results = [f"{r.get('title')}: {r.get('content')} ({r.get('url')})" for r in data.get("results", [])[:5]]
        return "\n---\n".join(results) if results else "No results."
    except Exception as e:
        return f"Search error: {e}"

def read_obsidian(filename: str) -> str:
    try:
        path = os.path.join(VAULT_PATH, filename)
        if not os.path.exists(path):
            return f"Note '{filename}' not found."
        with open(path, "r") as f:
            return f.read()
    except Exception as e:
        return f"Obsidian error: {e}"

def trigger_n8n(intent: str) -> str:
    try:
        resp = requests.post(f"{N8N_URL}/jarvis", json={"intent": intent}, timeout=5)
        return f"Signal Sent: {intent}" if resp.status_code == 200 else f"Failed: {resp.status_code}"
    except Exception as e:
        return f"n8n error: {e}"

def generate_media(media_type: str, prompt: str) -> str:
    try:
        template_path = WAN_TEMPLATE if media_type == "video" else JUGGERNAUT_TEMPLATE
        if not os.path.exists(template_path):
            return f"Template not found: {template_path}"
        
        with open(template_path, "r") as f:
            workflow = json.load(f)
            
        # Inject Prompt
        if media_type == "video":
            workflow["4"]["inputs"]["text"] = prompt
            endpoint = "generate_video"
        else:
            # Juggernaut XL Node 6 is CLIPTextEncode positive prompt
            workflow["6"]["inputs"]["text"] = prompt
            endpoint = "generate_image"
            
        logger.info(f"Sending {media_type} workflow to n8n endpoint: {endpoint}")
        # Send full workflow as the "prompt" key in the JSON body, which ComfyUI expects
        payload = {"prompt": workflow}
        
        resp = requests.post(f"{N8N_URL}/{endpoint}", json=payload, timeout=10)
        return f"Job sent to n8n (Status: {resp.status_code})"
    except Exception as e:
        logger.error(f"Generation error: {e}")
        return f"Generation error: {e}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

def agent_chat(agent: str, prompt: str, model: str = "") -> str:
    try:
        if agent.lower() == "gemini":
            # Call Gemini CLI
            cmd = ["gemini", prompt]
        elif agent.lower() == "opencode":
            # Call OpenCode CLI
            # Default to free model if none specified
            target_model = model if model else "opencode/glm-4.7-free"
            cmd = ["opencode", "run", prompt, "--model", target_model]
        else:
            return f"Unknown agent: {agent}"

        logger.info(f"Agent Call: {cmd}")
        # Run command (nexus-mcp container has these binaries in PATH)
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        output = result.stdout if result.stdout else result.stderr
        return output.strip()
    except Exception as e:
        logger.error(f"Agent error: {e}")
        return f"Agent execution failed: {e}"
