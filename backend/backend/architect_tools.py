import httpx
import json
import logging
from typing import Dict, Any, List
from .n8n_utils import N8nWorkflowBuilder, TOOLS

logger = logging.getLogger("architect_tools")

class ArchitectTools:
    """High-level logic for the Architect Agent to build and register tools."""
    
    BASE_URL = "http://nexus-console:8080" # Docker internal network (container-to-container)
    
    @classmethod
    async def build_and_register_workflow(cls, name: str, model: str, system_prompt: str, tools: List[str] = None):
        """
        Builds, registers, and deploys a NEW n8n workflow JSON structure.
        
        Args:
            name: Human readable name for the workflow (e.g. 'WebSearcher').
            model: The Ollama model to use for the agent node (e.g. 'qwen3:8b').
            system_prompt: The detailed identity and instructions for the agent within the workflow.
            tools: Names of tools to search for (e.g. ['search', 'http']).
        """
        logger.info(f"🏗️ Architect Building Workflow: {name} (Model: {model})")
        builder = N8nWorkflowBuilder()
        
        # 1. Create Nodes
        webhook = builder.create_webhook_node(path=name.lower().replace(" ", "-"))
        agent = builder.create_ai_agent_node(name=name, system_prompt=system_prompt)
        model_node = builder.create_ollama_node(model=model, name="Ollama Model")
        
        nodes = [webhook, agent, model_node]
        
        # 2. Build Connections
        # Webhook -> Agent
        connections = {
            webhook["name"]: {
                "main": [[{"node": agent["name"], "type": "main", "index": 0}]]
            },
            # Model -> Agent (LangChain)
            model_node["name"]: {
                "ai_languageModel": [[{"node": agent["name"], "type": "ai_languageModel", "index": 0}]]
            }
        }
        
        # Add Tools if requested
        if tools:
            for idx, tool_name in enumerate(tools):
                if "search" in tool_name.lower():
                    tool_node = builder.create_google_search_node(name=f"Search Tool {idx}")
                    nodes.append(tool_node)
                    # Tool -> Agent (LangChain)
                    connections[tool_node["name"]] = {
                        "ai_tool": [[{"node": agent["name"], "type": "ai_tool", "index": 0}]]
                    }
        
        workflow_data = {
            "name": name,
            "nodes": nodes,
            "connections": connections,
            "settings": {"executionOrder": "v1"}
        }
        
        async with httpx.AsyncClient() as client:
            # Step 1: Register (Save to disk)
            try:
                reg_resp = await client.post(f"{cls.BASE_URL}/architect/register_workflow", json=workflow_data)
                reg_resp.raise_for_status()
                logger.info(f"Successfully registered workflow: {name}")
            except Exception as e:
                logger.error(f"Registration failed: {e}")
                return {"error": "registration_failed", "details": str(e)}
            
            # Step 2: Deploy (Push to n8n)
            try:
                dep_resp = await client.post(f"{cls.BASE_URL}/architect/deploy_workflow", json={"workflow_data": workflow_data})
                dep_resp.raise_for_status()
                logger.info(f"Successfully deployed workflow: {name}")
                return {"status": "deployed", "file": reg_resp.json().get("file_path"), "n8n_id": dep_resp.json().get("id")}
            except Exception as e:
                logger.warning(f"Deployment failed (workflow saved but not pushed): {e}")
                return {"status": "registered_only", "file": reg_resp.json().get("file_path"), "warning": "deployment_failed"}

    @classmethod
    async def trigger_n8n_workflow(cls, workflow_path: str, payload: Dict[str, Any]):
        """Trigger an n8n workflow after checking if target pods are alive."""
        # 1. Proactive Self-Healing Check (Docker SDK - proper way)
        if "image" in workflow_path.lower():
            logger.info("🛡️ Self-Healing: Checking ComfyUI status before trigger...")
            try:
                import docker
                client = docker.from_env()
                container = client.containers.get("nexus-comfyui")
                if container.status != "running":
                    logger.warning("⚠️ ComfyUI is DOWN. Auto-starting via Docker SDK...")
                    container.start()
                    # Give it a moment to initialize
                    import asyncio
                    await asyncio.sleep(3)
                    logger.info("✅ ComfyUI started successfully!")
            except Exception as e:
                logger.warning(f"Could not verify/start ComfyUI: {e}")

        # 2. Standard Webhook Trigger
        webhook_url = f"http://nexus-n8n:5678/webhook/{workflow_path.strip('/')}"
        logger.info(f"🔗 Triggering n8n workflow: {workflow_path} at {webhook_url}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(webhook_url, json=payload, timeout=60.0)
                response.raise_for_status()
                result = {"status": "success", "result": response.json()}
                
                # 3. Auto-Shutdown ComfyUI after single image (not video loops)
                if "image" in workflow_path.lower():
                    prompt_text = str(payload.get("prompt", "")).lower()
                    is_video_loop = any(kw in prompt_text for kw in ["video", "loop", "animate", "sequence"])
                    
                    if not is_video_loop:
                        logger.info("💤 Image complete. Shutting down ComfyUI to free VRAM...")
                        try:
                            import docker
                            docker_client = docker.from_env()
                            container = docker_client.containers.get("nexus-comfyui")
                            container.stop()
                            logger.info("✅ ComfyUI stopped successfully!")
                        except Exception as e:
                            logger.warning(f"Could not stop ComfyUI: {e}")
                    else:
                        logger.info("🎬 Video/loop detected. Keeping ComfyUI alive.")
                
                return result
            except Exception as e:
                logger.error(f"Failed to trigger n8n workflow {workflow_path}: {e}")
                return {"status": "error", "details": str(e)}

    @classmethod
    async def search_vault(cls, query: str, limit: int = 15):
        """Simple grep-based vault search (helper for search_vault_council)."""
        import subprocess
        try:
            vault_path = "/home/anon/AI work/anon"
            cmd = ["grep", "-r", "-i", "-C", "2", query, vault_path]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5.0)
            if not result.stdout:
                return "No matching fragments found in the vault."
            return "\n".join(result.stdout.splitlines()[:limit])
        except Exception as e:
            return f"Library search failed: {str(e)}"


    @classmethod
    async def search_vault_council(cls, query: str):
        """
        Council-based Smart Library search:
        1. Spawn 2 small models (Sentinel + Liquid 1.2B).
        2. Each generates a different search perspective.
        3. Consolidate results via the Manager model.
        """
        logger.info(f"🏛️ Council Search initiated for: {query}")
        from .vram_manager import vram_manager, VRAM_MANAGER_SENTINEL, VRAM_MANAGER_PRIMARY
        
        # Perspectives to search from
        perspectives = ["Technical Details", "Conceptual/Logic", "Last Session Context"]
        all_results = []
        
        async with httpx.AsyncClient() as client:
            # 1. Ask the Sentinel (1B) for a query perspective
            sent_resp = await client.post(f"http://nexus-ollama:11434/api/generate", json={
                "model": VRAM_MANAGER_SENTINEL,
                "prompt": f"Given the task '{query}', what is one keyword to search for technical details? Respond with ONLY the word.",
                "stream": False
            })
            keyword = sent_resp.json().get("response", "nexus").strip().strip('"')
            
            # 2. Run the search for that keyword
            logger.info(f"🔎 Council Member 1 searching for: {keyword}")
            res1 = await cls.search_vault(keyword)
            all_results.append(f"Source: Technical search for '{keyword}':\n{res1}")

            # 3. Use the Manager (8B) to synthesize the 'Best Answer'
            synth_prompt = (
                f"You are the Council Judge. Below are search results for '{query}'.\n"
                f"Identify the MOST IMPORTANT 3 sentences that solve the user's request. \n\n"
                f"RESULTS:\n{all_results[0]}\n"
            )
            
            judge_resp = await client.post(f"http://nexus-ollama:11434/api/generate", json={
                "model": VRAM_MANAGER_PRIMARY,
                "prompt": synth_prompt,
                "stream": False
            })
            
            return judge_resp.json().get("response", "No consensus reached.")

# Export instance
architect_tools = ArchitectTools()
