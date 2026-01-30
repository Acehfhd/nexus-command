import os
import yaml
import logging
from google.adk.agents import Agent, LlmAgent
from google.adk.runners import Runner
from .vram_manager import vram_manager, VRAM_MANAGER_PRIMARY, VRAM_MANAGER_SENTINEL
from google.genai.types import Content, Part
from .mcp_client import nexus_mcp
from google.adk.models import LiteLlm  # Essential for ADK 1.22.0

# Persistent session service (PostgreSQL with memory fallback)
from .pg_session_service import session_service

# 🤖 AGENT TEAM DEFINITION
# This module defines the 4-agent swarm using Google ADK.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agents")

# Load configuration - corrected path for container volume
CONFIG_PATH = "/workspace/tools/Nexus_Connector/config/agent_models.yaml"

def load_config():
    try:
        with open(CONFIG_PATH, "r") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        logger.warning(f"Config not found at {CONFIG_PATH}, using defaults")
        return {
            "models": {
                "manager": {"model": "qwen3:14b"},
                "coder": {"model": "gpt-oss-safeguard:20b"},
                "browser": {"model": "qwen3-vl:8b"},
                "auditor": {"model": "qwen3:8b"}
            },
            "litellm": {
                "endpoint": "http://nexus-console:4000",
                "ollama_backend": "http://nexus-ollama:11434"
            }
        }

config = load_config()
models = config["models"]

# --- Agent Definitions using Google ADK LlmAgent ---

# 1. Nexus (Manager) - Primarily uses qwen3:8b
# Orchestrates tasks and routes to specialists.
manager = LlmAgent(
    name="Nexus",
    model=LiteLlm(f"ollama_chat/{models['manager']['model']}"),
    instruction=(
        "You are Nexus Prime, the manager of the ADK Swarm.\n"
        "1. Dispatch tasks to Architect (Operator/Auditor) as needed.\n"
        "2. If the user asks to 'switch model', 'use deepseek', or 'wake up a specialist', acknowledge the request. "
        "The system will handle the VRAM swap automatically based on your routing.\n"
        "3. Keep responses concise and professional."
    ),
    sub_agents=[]  # Will be populated below
)

from .n8n_utils import N8nWorkflowBuilder, TOOLS
from .architect_tools import architect_tools
from .social import post_x_tweet, post_discord_alert

# 2. Architect (Coder & System Designer) - deepseek-r1:14b
# Handles code, filesystem, and n8n workflow generation.
architect = LlmAgent(
    name="Architect",
    model=LiteLlm(f"ollama_chat/{models['coder']['model']}"),
    instruction=(
        "You are The Architect. Your mission is system self-expansion through high-quality code and n8n workflows.\n"
        "1. Generate Python code and manage the filesystem via MCP tools.\n"
        "2. Design and generate n8n JSON workflows using the build_and_register_workflow tool.\n"
        "   - WEBHOOKS: Use path name related to the task.\n"
        "   - NODES: Include 'id', 'name', 'type' (e.g., n8n-nodes-base.httpRequest), and 'position'.\n"
        "   - CONNECTIONS: Map outputs to inputs in the 'main' array. Index 0 is standard.\n"
        "3. TRIGGER existing n8n workflows using the trigger_n8n_workflow tool. \n"
        "   - Use path 'nexus-router' for general routing.\n"
        "4. CONSULT the Knowledge Base via the search_vault_council tool.\n"
        "When asked to 'create a tool' or 'build a workflow', call the build_and_register_workflow tool."
    ),
    tools=[
        architect_tools.build_and_register_workflow,
        architect_tools.trigger_n8n_workflow,
        architect_tools.search_vault_council
    ]
)

# 3. Operator (Browser) - qwen3-vl:8b
# Vision-based browser automation.
operator = LlmAgent(
    name="Operator",
    model=LiteLlm(f"ollama_chat/{models['browser']['model']}"),
    instruction="You are The Operator. You control the browser and analyze screenshots to automate web tasks."
)

# 4. Auditor (Security) - granite3.3:8b
# Reviews all code for security vulnerabilities.
auditor = LlmAgent(
    name="Auditor",
    model=LiteLlm(f"ollama_chat/{models['auditor']['model']}"),
    instruction="You are The Auditor. Perform rigorous security scans on all code and detect generic vulnerabilities or drainer logic."
)

# 5. Social (Engagement & Alerts) - qwen3:8b
# Manages social media presence and community alerts.
social_agent = LlmAgent(
    name="Social",
    model=LiteLlm(f"ollama_chat/{models['auditor']['model']}"),
    instruction=(
        "You are The Social Agent. Your mission is to engage the community and broadcast system updates.\n"
        "1. Post updates, alpha, and milestones to X (Twitter) using the post_x_tweet tool.\n"
        "2. Send important alerts and trade reports to Discord via post_discord_alert.\n"
        "3. Maintain a 'Rick' aesthetic: intelligent, slightly cynical, and highly technical."
    ),
    tools=[post_x_tweet, post_discord_alert]
)

# Set up swarm hierarchy - manager delegates to sub-agents
manager.sub_agents = [architect, operator, auditor, social_agent]

# --- Execution Wrapper with VRAM Management ---

async def run_swarm_task(task: str):
    """Execution wrapper that handles Sentry Mode and VRAM loading."""
    logger.info(f"🚀 Nexus receiving task: {task[:50]}...")
    
    # Use VRAM Manager to decide which model to load (1B Sentinel vs 8B Swarm)
    target_model = await vram_manager.prepare_for_task(task)
    
    try:
        # 1. Ensure a session exists (ADK 1.22.0 style)
        session = await session_service.get_session(
            app_name="nexus_prime",
            user_id="nexus-user",
            session_id="nexus-session"
        )
        if not session:
            session = await session_service.create_session(
                app_name="nexus_prime",
                user_id="nexus-user",
                session_id="nexus-session"
            )

        # 2. Update agent model based on routing
        # If it's the Sentinel model, we skip the heavy swarm agents
        if target_model == VRAM_MANAGER_SENTINEL:
             current_agent = LlmAgent(
                 name="Sentinel",
                 model=LiteLlm(f"ollama_chat/{VRAM_MANAGER_SENTINEL}"),
                 instruction=(
                     "You are the Nexus Sentinel, a low-VRAM system watcher.\n"
                     "1. Respond concisely to greetings and simple status checks.\n"
                     "2. Do NOT narrate or summarize previous complex tasks unless specifically asked.\n"
                     "3. Your primary job is to tell the user when the swarm is 'Sleeping' or 'Waking up'."
                 )
             )
        else:
             current_agent = manager

        # 3. Create a runner and execute the task
        runner = Runner(
            agent=current_agent,
            app_name="nexus_prime",
            session_service=session_service
        )
        
        # 4. Wrap the task in a Content object (ADK 1.22.0 requirement)
        user_message = Content(role="user", parts=[Part(text=task)])
        
        # 5. Iterate over the event stream (ADK 1.22.0 pattern)
        final_response = ""
        async for event in runner.run_async(
            user_id=session.user_id,
            session_id=session.id,
            new_message=user_message
        ):
            # Capture content parts (ADK 1.22.0)
            if hasattr(event, "content") and event.content:
                content = event.content
                if hasattr(content, "parts"):
                    for part in content.parts:
                        # Skip inner monologue/thoughts
                        if hasattr(part, "thought") and part.thought:
                            continue
                        if hasattr(part, "text") and part.text:
                            final_response += part.text
                elif isinstance(content, str):
                    final_response += content
            
        # Refresh activity timer after task is done so we don't hibernate while user reads
        vram_manager.update_activity()
        
        return final_response.strip() or "The swarm is standing by. (No response captured)"
    finally:
        # We don't unload here anymore! The VRAMManager timer will handle it after 5 mins.
        pass

# Export for main.py
swarm = manager  # The manager is the root of the swarm
