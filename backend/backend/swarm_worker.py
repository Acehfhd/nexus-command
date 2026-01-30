import os
import sys
import asyncio
import logging

# Ensure backend folder is in path for imports
backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("swarm_worker")

async def worker_loop():
    logger.info("🐝 Nexus Swarm Worker (Omni-Beast) initializing...")
    
    # Defer imports until loop is running
    from .nexus_bus import bus
    from .agents import run_swarm_task, vram_manager
    
    # Start loop-local monitoring
    vram_manager.start_monitoring()
    
    logger.info("📡 Listening for signals on channel: 'swarm_tasks'...")
    
    async for msg in bus.subscribe("swarm_tasks"):
        task = msg.get("task")
        request_id = msg.get("id", "unknown")
        
        if not task:
            continue
            
        logger.info(f"📥 [ID: {request_id}] Received task: {task[:100]}...")
        
        try:
            # Execute the task via ADK Swarm
            result = await run_swarm_task(task)
            
            logger.info(f"✅ [ID: {request_id}] Task completed successfully.")
            
            # Publish result back
            await bus.publish("swarm_results", {
                "id": request_id,
                "status": "SUCCESS",
                "result": str(result)
            })
            
        except Exception as e:
            import traceback
            logger.error(f"❌ [ID: {request_id}] Task failed: {e}")
            logger.error(traceback.format_exc())
            await bus.publish("swarm_results", {
                "id": request_id,
                "status": "FAILED",
                "error": str(e)
            })

if __name__ == "__main__":
    try:
        # We need to run this as a package: python3 -m backend.swarm_worker
        asyncio.run(worker_loop())
    except KeyboardInterrupt:
        logger.info("🛑 Swarm Worker shutting down.")
    except Exception as e:
        import traceback
        logger.error(f"💥 Swarm Worker crashed: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)
