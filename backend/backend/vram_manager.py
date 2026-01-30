import httpx
import logging
import asyncio
import time
from typing import Optional, List

# 🕵️ VRAM MANAGER & MODEL ORCHESTRATOR
# This module manages model loading/unloading to stay within 16GB VRAM.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vram_manager")

OLLAMA_BASE_URL = "http://nexus-ollama:11434"

# Model Configuration
PRIMARY_MANAGER = "qwen3:8b"     # ~5.2 GB
SENTINEL_MODEL = "llama3.2:1b"   # ~1.3 GB (Watcher)
CODER_MODEL = "deepseek-r1:14b"  # ~9.0 GB
BROWSER_MODEL = "qwen3-vl:8b"    # ~6.1 GB
AUDITOR_MODEL = "granite3.3:8b"  # ~4.9 GB

VRAM_LIMIT_GB = 16.0
INACTIVITY_TIMEOUT = 300 # 5 Minutes in seconds

class VRAMManager:
    def __init__(self):
        self.current_loaded_models: List[str] = []
        self.is_fallback_active = False
        self.last_activity_time = time.time()
        self.is_sentry_mode = False
        self._watcher_task = None

    def start_monitoring(self):
        """Start the background inactivity watcher."""
        if self._watcher_task is None:
            self._watcher_task = asyncio.create_task(self._inactivity_loop())
            logger.info("🕵️ Sentry Monitor started (5min timeout)")

    async def _inactivity_loop(self):
        """Background loop to unload large models after inactivity."""
        while True:
            await asyncio.sleep(30) # Check every 30s
            elapsed = time.time() - self.last_activity_time
            
            if elapsed > INACTIVITY_TIMEOUT and not self.is_sentry_mode:
                logger.info(f"💤 Inactivity detected ({int(elapsed)}s). Entering Sentry Mode...")
                await self.enter_sentry_mode()

    def update_activity(self):
        """Reset the inactivity timer."""
        self.last_activity_time = time.time()
        if self.is_sentry_mode:
            logger.info("🔔 Activity detected. Exiting Sentry Mode...")
            self.is_sentry_mode = False

    async def enter_sentry_mode(self):
        """Unload heavy models and ensure Sentinel is loaded."""
        logger.info("🛡️ Entering Sentry Mode (Hibernation)...")
        # Unload everything except Sentinel
        await self.unload_all_except([SENTINEL_MODEL])
        
        # Pre-load Sentinel for fast response
        async with httpx.AsyncClient() as client:
            await client.post(f"{OLLAMA_BASE_URL}/api/generate", json={
                "model": SENTINEL_MODEL, 
                "prompt": "Status Check", 
                "keep_alive": "24h" # Sentinel stays on
            })
            
        self.is_sentry_mode = True
        logger.info("✅ Sentry Mode active. Heavy models unloaded.")

    async def get_loaded_models(self) -> List[str]:
        """Fetch currently loaded models from Ollama."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{OLLAMA_BASE_URL}/api/ps")
                if response.status_code == 200:
                    data = response.json()
                    loaded = [m['name'] for m in data.get('models', [])]
                    self.current_loaded_models = loaded
                    return loaded
        except Exception as e:
            logger.error(f"Failed to fetch loaded models: {e}")
        return []

    async def unload_model(self, model_name: str):
        """Force Ollama to unload a model by setting keep_alive to 0."""
        logger.info(f"💾 Unloading model: {model_name}")
        try:
            async with httpx.AsyncClient() as client:
                # Use timeout to prevent hanging
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={"model": model_name, "prompt": "", "keep_alive": 0},
                    timeout=30.0
                )
                # Allow time for VRAM to actually free
                await asyncio.sleep(1.0)
        except Exception as e:
            logger.error(f"Failed to unload {model_name}: {e}")

    async def unload_all_except(self, keep_models: List[str]):
        """Unload all models NOT in the keep list."""
        async with httpx.AsyncClient(timeout=180.0) as client:
            try:
                loaded = await self.get_loaded_models()
                for model in loaded:
                    # Check if model starts with any of the keep names (to handle tags)
                    if not any(model.startswith(k) for k in keep_models):
                        await self.unload_model(model)
            except Exception as e:
                logger.error(f"Failed to unload models: {e}")

    async def prepare_for_task(self, task: str):
        """Decide which model to load based on task complexity."""
        self.update_activity()
        
        task_lower = task.lower()
        # Complex triggers (8B/14B models)
        is_complex = any(kw in task_lower for kw in ["code", "write", "architect", "deepseek", "deep seek", "qwen", "research", "solve", "sell", "fix", "build", "math", "image", "generate", "comfyui", "render"])
        
        if is_complex:
            # If DeepSeek-specific, we might eventually need 9GB free
            if "deepseek" in task_lower or "deep seek" in task_lower or "r1" in task_lower:
                logger.info("🐉 DeepSeek request detected. Preparing heavy VRAM headspace...")
                # Note: Currently manager routes to DeepSeek via ADK
            
            if PRIMARY_MANAGER not in await self.get_loaded_models():
                logger.info(f"🚀 Complex task detected. Waking up {PRIMARY_MANAGER}...")
                async with httpx.AsyncClient() as client:
                    await client.post(f"{OLLAMA_BASE_URL}/api/generate", json={
                        "model": PRIMARY_MANAGER, 
                        "prompt": "Awaken", 
                        "keep_alive": "30m"
                    }, timeout=60.0)
            return PRIMARY_MANAGER
        else:
            logger.info(f"🛡️ Simple task detected. Using Sentinel {SENTINEL_MODEL}...")
            return SENTINEL_MODEL

    async def prepare_for_generation(self):
        """
        Urgent VRAM Clearing for Image Generation (ComfyUI).
        Unloads ALL LLMs to free up maximum VRAM for flux/sdxl.
        """
        logger.info("🎨 Image Generation Request detected. Clearing VRAM...")
        try:
            # Unload everything. Image Gen needs 100% of the card.
            await self.unload_all_except([]) 
            logger.info("✅ VRAM Cleared for ComfyUI.")
        except Exception as e:
            logger.error(f"Failed to prepare for generation: {e}")

vram_manager = VRAMManager()
# vram_manager.start_monitoring()  # Call this explicitly within an active event loop

# Export constants for easy access
VRAM_MANAGER_PRIMARY = PRIMARY_MANAGER
VRAM_MANAGER_SENTINEL = SENTINEL_MODEL
