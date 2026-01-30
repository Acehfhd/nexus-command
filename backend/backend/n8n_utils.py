import json
from typing import List, Dict, Any

class N8nWorkflowBuilder:
    """Utility to build n8n workflow JSON structures for AI Agents."""
    
    @staticmethod
    def create_ai_agent_node(name: str, system_prompt: str) -> Dict[str, Any]:
        """Creates a standard n8n AI Agent node configuration."""
        return {
            "parameters": {
                "agent": "conversational",
                "promptSystem": system_prompt,
                "options": {}
            },
            "id": name.lower().replace(" ", "_"),
            "name": name,
            "type": "@n8n/n8n-nodes-langchain.agent",
            "typeVersion": 1.7,
            "position": [250, 300]
        }

    @staticmethod
    def create_ollama_node(model: str = "qwen3:8b", name: str = "Ollama Model") -> Dict[str, Any]:
        """Creates an Ollama Model node for LangChain."""
        return {
            "parameters": {
                "model": model,
                "options": {}
            },
            "id": name.lower().replace(" ", "_"),
            "name": name,
            "type": "@n8n/n8n-nodes-langchain.lmChatOllama",
            "typeVersion": 1,
            "position": [100, 500]
        }

    @staticmethod
    def create_google_search_node(name: str = "Google Search") -> Dict[str, Any]:
        """Creates a Google Search (SerpApi) tool node for LangChain."""
        return {
            "parameters": {},
            "id": name.lower().replace(" ", "_"),
            "name": name,
            "type": "@n8n/n8n-nodes-langchain.toolSerpApi",
            "typeVersion": 1,
            "position": [400, 500]
        }

    @staticmethod
    def create_webhook_node(path: str = "ai-webhook") -> Dict[str, Any]:
        """Creates a standard n8n Webhook entry node."""
        return {
            "parameters": {
                "path": path,
                "options": {}
            },
            "id": "webhook",
            "name": "Webhook",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 1,
            "position": [0, 300]
        }

    @staticmethod
    def create_workflow(nodes: List[Dict[str, Any]], connections: Dict[str, Any]) -> str:
        """Wraps nodes into a full n8n workflow JSON string."""
        workflow = {
            "name": "Untitled Workflow", # Should be overridden by caller
            "nodes": nodes,
            "connections": connections,
            "settings": {
                "executionOrder": "v1"
            }
        }
        return json.dumps(workflow, indent=2)

# Common Tool Templates
# These are used by the Agent to decide which nodes to build
TOOLS = {
    "GOOGLE_SEARCH": "n8n-nodes-langchain.toolGoogleSearch",
    "HTTP_REQUEST": "n8n-nodes-base.httpRequest" # Note: LangChain HTTP request might differ
}
