
import os
import sys
import json
import logging
import datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer

# Basic Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
VAULT_PATH = "/vault"

# ChromaDB Setup
CHROMA_PATH = "/app/chroma_db"
client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection(name="nexus_memory")
model = SentenceTransformer('all-MiniLM-L6-v2')

class ToolCall(BaseModel):
    name: str
    arguments: dict

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Nexus Memory Pod (Vector Enhanced)"}

@app.post("/mcp/call")
def call_tool(tool: ToolCall):
    logger.info(f"Tool Call: {tool.name}")
    try:
        if tool.name == "search_vault":
             # Hybrid Search: Vector + Keyword
             return {"content": search_vault(tool.arguments.get("query", ""))}
        elif tool.name == "read_note":
             return {"content": read_note(tool.arguments.get("filename", ""))}
        elif tool.name == "daily_log":
             return {"content": daily_log(tool.arguments.get("content", ""))}
        elif tool.name == "memorize":
             return {"content": vectorize_note(tool.arguments.get("filename", ""))}
        else:
             raise HTTPException(status_code=404, detail="Tool not found")
    except Exception as e:
        return {"error": str(e)}

# --- Implementation ---

def search_vault(query: str) -> str:
    """Semantic Search using ChromaDB."""
    try:
        results = collection.query(
            query_texts=[query],
            n_results=5
        )
        # Format results
        output = ["🔍 Vector Search Results:"]
        for i, doc in enumerate(results['documents'][0]):
            meta = results['metadatas'][0][i]
            output.append(f"- [{meta['filename']}] {doc[:100]}...")
        return "\n".join(output)
    except Exception as e:
        return f"Vector Error: {e}"

def vectorize_note(filename: str) -> str:
    """Ingests a note into the Vector DB."""
    try:
        path = Path(VAULT_PATH) / filename
        if not path.exists(): return "File not found."
        content = path.read_text(encoding='utf-8')
        
        collection.add(
            documents=[content],
            metadatas=[{"filename": filename}],
            ids=[filename]
        )
        return f"🧠 Memorized: {filename}"
    except Exception as e:
        return f"Error: {e}"

def read_note(filename: str) -> str:
    """Reads a markdown note."""
    try:
        safe_path = Path(VAULT_PATH) / filename
        if not safe_path.exists(): return "Note not found."
        return safe_path.read_text(encoding='utf-8')
    except Exception as e: return str(e)

def daily_log(content: str) -> str:
    """Appends to daily note."""
    try:
        today = datetime.date.today().isoformat()
        filename = f"{today}.md"
        path = Path(VAULT_PATH) / filename
        timestamp = datetime.datetime.now().strftime("%H:%M")
        entry = f"\n\n## {timestamp}\n{content}"
        with open(path, "a", encoding="utf-8") as f:
            f.write(entry)
        # Auto-memorize logic could go here
        return f"Logged to {filename}"
    except Exception as e: return str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
