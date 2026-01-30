import asyncio
import logging
import re
import os
from .agents import run_swarm_task

logger = logging.getLogger("reflection")

class ReflectionLoop:
    def __init__(self):
        self.is_running = False
        self.task_file = None
        self._loop_task = None
        self.status = "IDLE"
        self.current_step = None

    async def start(self, task_file: str):
        """Start the reflection loop monitoring the given task file."""
        if self.is_running:
            return {"status": "already_running"}
        
        # Verify file exists
        if not os.path.exists(task_file):
            return {"status": "error", "message": f"File not found: {task_file}"}

        self.is_running = True
        self.task_file = task_file
        self._loop_task = asyncio.create_task(self._monitor_loop())
        logger.info(f"🧠 Reflection loop started. Monitoring: {task_file}")
        return {"status": "started", "file": task_file}

    async def stop(self):
        """Stop the reflection loop."""
        self.is_running = False
        self.status = "STOPPING"
        if self._loop_task:
            self._loop_task.cancel()
            try:
                await self._loop_task
            except asyncio.CancelledError:
                pass
        self.status = "STOPPED"
        self.current_step = None
        logger.info("🧠 Reflection loop stopped")
        return {"status": "stopped"}

    async def _monitor_loop(self):
        """Main loop that checks task.md and triggers agents."""
        logger.info("🧠 Monitor loop active")
        self.status = "MONITORING"
        
        while self.is_running:
            try:
                # 1. Read task.md
                next_task = self._get_next_task()
                
                if next_task:
                    logger.info(f"🧠 Found active task: {next_task}")
                    self.status = "EXECUTING"
                    self.current_step = next_task
                    
                    # 2. Trigger Swarm
                    # Call the manager agent to handle this specific item
                    result = await run_swarm_task(
                        f"I am the Reflection Loop. I found this unchecked item in task.md: '{next_task}'. "
                        f"Please execute it and then mark it as completed in '{self.task_file}'."
                    )
                    
                    logger.info(f"🧠 Task execution result: {result[:50]}...")
                    
                    # 3. Cooldown
                    self.status = "COOLDOWN"
                    self.current_step = None
                    await asyncio.sleep(5) 
                    self.status = "MONITORING"
                else:
                    # No tasks found, check again in 10s
                    logger.debug("🧠 No tasks found. Waiting...")
                    await asyncio.sleep(10)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"🧠 Loop error: {e}")
                self.status = "ERROR"
                await asyncio.sleep(10) # Backoff

    def _get_next_task(self):
        """Parse task.md and find the first unchecked item."""
        try:
            with open(self.task_file, 'r') as f:
                lines = f.readlines()
            
            for line in lines:
                # Match "- [ ] Task Name" but ignore sub-tasks if parent is unchecked? 
                # Simple logic: Find first "- [ ] "
                # Ignore comments or empty lines
                if match := re.match(r'^\s*-\s*\[\s*\]\s*(.+)', line):
                    # Check if it has an ID comment, capture the text
                    # e.g. "- [ ] Task <!-- id: 1 -->"
                    task_text = match.group(1).strip()
                    # Remove HTML comments if present for cleaner prompting
                    task_text = re.sub(r'<!--.*?-->', '', task_text).strip()
                    return task_text
            return None
        except Exception as e:
            logger.error(f"Failed to read task file: {e}")
            return None

# Singleton instance
reflection_loop = ReflectionLoop()
