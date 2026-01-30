import asyncio
import time
import uuid
import logging
from nexus_bus import bus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_bus")

async def test_concurrency():
    """
    Spawns 10 concurrent listeners and sends 100 messages.
    Verifies that all 1000 message receptions are captured.
    """
    NUM_LISTENERS = 10
    NUM_MESSAGES = 100
    CHANNEL = "concurrency_test"
    
    reception_count = 0
    latencies = []

    async def listener(id):
        nonlocal reception_count
        logger.info(f"👂 Listener {id} online.")
        async for msg in bus.subscribe(CHANNEL):
            reception_count += 1
            sent_time = msg.get("ts", 0)
            latencies.append(time.time() - sent_time)
            if msg.get("final"):
                break

    # 1. Start listeners
    listeners = [asyncio.create_task(listener(i)) for i in range(NUM_LISTENERS)]
    await asyncio.sleep(1) # Give listeners time to setup LISTEN

    # 2. Publish messages
    logger.info(f"🚀 Publishing {NUM_MESSAGES} messages...")
    start_time = time.time()
    for i in range(NUM_MESSAGES):
        is_final = (i == NUM_MESSAGES - 1)
        await bus.publish(CHANNEL, {"id": i, "ts": time.time(), "final": is_final})
    
    # 3. Wait for completion
    try:
        await asyncio.wait_for(asyncio.gather(*listeners), timeout=10)
    except asyncio.TimeoutError:
        logger.error("🛑 Test timed out! Some messages might have been lost.")

    # 4. Results
    total_expected = NUM_LISTENERS * NUM_MESSAGES
    success_rate = (reception_count / total_expected) * 100
    
    p99_latency = sorted(latencies)[int(len(latencies) * 0.99)] if latencies else 0

    logger.info("--- TEST RESULTS ---")
    logger.info(f"Expected Receptions: {total_expected}")
    logger.info(f"Actual Receptions: {reception_count}")
    logger.info(f"Success Rate: {success_rate:.2f}%")
    logger.info(f"P99 Latency: {p99_latency*1000:.2f}ms")
    
    if success_rate < 100:
        logger.error("❌ DATA LOSS DETECTED.")
    else:
        logger.info("✅ NO DATA LOSS DETECTED.")

if __name__ == "__main__":
    asyncio.run(test_concurrency())
