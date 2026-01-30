import asyncio
import json
import logging
import asyncpg
from typing import Optional, Callable, Any, AsyncGenerator

logger = logging.getLogger("nexus_bus")

class PostgresBus:
    """
    Minimalist, High-Performance Message Bus using Postgres LISTEN/NOTIFY.
    """
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.pool: Optional[asyncpg.Pool] = None
        self._listen_conn: Optional[asyncpg.Connection] = None
        self._subscribers: dict[str, set[Callable]] = {}

    async def connect(self):
        """Initializes the connection pool."""
        if not self.pool:
            logger.info("🔗 Connecting to Swarm Bus (Postgres)...")
            self.pool = await asyncpg.create_pool(self.dsn)

    async def publish(self, channel: str, message: dict):
        """Sends a JSON-encoded notification to the specified channel."""
        if not self.pool:
            await self.connect()
        
        payload = json.dumps(message)
        async with self.pool.acquire() as conn:
            # Postgres NOTIFY has a payload limit of 8000 bytes.
            # For massive payloads, we would store in a table and notify the ID.
            if len(payload) > 7900:
                logger.warning(f"⚠️ Payload on {channel} is large ({len(payload)} bytes). Risk of truncation.")
            
            # Escape single quotes for the NOTIFY payload
            safe_payload = payload.replace("'", "''")
            await conn.execute(f"NOTIFY {channel}, '{safe_payload}'")

    async def subscribe(self, channel: str) -> AsyncGenerator[dict, None]:
        """
        Asynchronous generator that yields messages from a specific channel.
        Uses a dedicated connection for LISTEN.
        """
        # Create a dedicated connection for listening
        conn = await asyncpg.connect(self.dsn)
        try:
            await conn.add_listener(channel, self._raw_handler)
            logger.info(f"👂 Subscribed to swarm channel: {channel}")
            
            # This is a bit of a hack to turn the callback-based listener into a generator
            queue = asyncio.Queue()
            
            def callback(connection, pid, channel, payload):
                asyncio.create_task(queue.put(json.loads(payload)))
                
            await conn.add_listener(channel, callback)
            
            while True:
                msg = await queue.get()
                yield msg
        finally:
            await conn.close()

    def _raw_handler(self, connection, pid, channel, payload):
        """Internal callback for asyncpg listener."""
        pass # Actual logic handled in the closure above

# Global Bus instance
# Assuming POSTGRES_URL is available in env or passed during init
import os
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://nexus:nexus_local_only@nexus-postgres:5432/nexus_sessions")
bus = PostgresBus(POSTGRES_URL.replace("postgresql+asyncpg://", "postgresql://"))
