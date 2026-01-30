import asyncio
import os
import sys

# Ensure backend folder is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from backend.nexus_bus import bus

async def main():
    print("🚀 Triggering Mission: SuccessProofV6...")
    task = "Architect, you MUST use the `build_and_register_workflow` tool to create a workflow named 'SuccessProofV6'. Model: 'qwen3:8b'. System Prompt: 'You are a research assistant'. Tools: ['search']. DO NOT HALLUCINATE. CALL THE TOOL."
    await bus.publish("swarm_tasks", {
        "id": "mission-v6",
        "task": task
    })
    print("✅ Task sent!")
    
    # Listen for result
    print("👂 Waiting for result...")
    try:
        async for msg in bus.subscribe("swarm_results"):
            if msg.get("id") == "mission-v6":
                print(f"📬 Result: {msg}")
                # Print result content for clarity
                if "result" in msg:
                    print(f"📝 Content: {msg['result']}")
                break
    except Exception as e:
        print(f"❌ Error listening: {e}")

if __name__ == "__main__":
    asyncio.run(main())
