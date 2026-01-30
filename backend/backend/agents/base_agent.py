import asyncio
import signal
import logging
import json
from abc import ABC, abstractmethod
from typing import Optional

# Assumption: Logic Specialist will create nexus_bus.py
# For now, we provide a placeholder or import if it exists.
try:
    from ..nexus_bus import bus
except ImportError:
    bus = None

class BaseAgent(ABC):
    """
    Standard Base class for all decoupled Nexus Agents.
    Handles bus connectivity, life-cycle, and status reporting.
    """
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"agent.{name}")
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        """Starts the agent's main loop."""
        self.logger.info(f"🚀 Starting {self.name}...")
        self._running = True
        
        # Setup Signal Handling
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, self.stop)

        # Report Online Status
        await self.report_status("Online")
        
        try:
            await self.run()
        except asyncio.CancelledError:
            self.logger.info(f"🛑 {self.name} cancelled.")
        except Exception as e:
            self.logger.error(f"💥 {self.name} failed: {e}")
            await self.report_status("Error", detail=str(e))
        finally:
            self._running = False
            await self.report_status("Offline")

    def stop(self):
        """Triggers graceful shutdown."""
        self.logger.info(f"📡 Shutdown signal received for {self.name}.")
        self._running = False
        if self._task:
            self._task.cancel()

    async def report_status(self, status: str, detail: str = ""):
        """Publishes agent status to the nexus_bus."""
        if bus:
            payload = {
                "agent": self.name,
                "status": status,
                "detail": detail,
                "timestamp": asyncio.get_event_loop().time()
            }
            await bus.publish("swarm_status", payload)
        self.logger.info(f"📊 Status: [{status}] {detail}")

    @abstractmethod
    async def run(self):
        """Main execution logic to be implemented by specialists."""
        pass
