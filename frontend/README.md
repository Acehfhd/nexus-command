# 🛡️ Nexus Dashboard (Mission Control)

The central command interface for the Nexus Operating System. Built with **React**, **Vite**, **Tailwind**, and **Shadcn/UI**.

## 🚀 Features (v1.1)

### 🧠 Intelligence & Memory
- **Real-Time Streaming**: Chat with agents via WebSocket (`ws://localhost:8090`). Tokens appear instantly.
- **Memory Dashboard**: Browse system events, logs, and agent memories at `/memory`.
- **Chat Persistence**: Save, Load, and Delete conversation sessions.

### 🎛️ Mission Control
- **Docker Management**: Start/Stop/Restart containers (Ollama, ComfyUI, etc.).
- **System Metrics**: Real-time AMD GPU, CPU, and RAM monitoring.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, TypeScript.
- **Styling**: Tailwind CSS, Framer Motion, Lucide Icons.
- **State**: Zustand (Store), React Query (Async).
- **Backend Link**: Connects to `Nexus Connector` (FastAPI) at port `8090`.

## 📦 Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Dashboard runs at http://localhost:8091
```

## 📚 Documentation
- **Project Status**: See `AGENT.md` for detailed roadmap and agent tasks.
- **Global Handoff**: See `../../rag/docs/ADK_HANDOFF.md`.

## 🐛 Known Issues
- **Sentinel Hallucination**: The 1B parameter Sentinel model may break character if prompted creatively (e.g., "tell a story"). 
