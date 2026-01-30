# Nexus Prime (Erebus) 🌌
> **System Completion**: 🟢 **65%** (Foundation Live, Logic Resurrection In Progress) 
> **Training Status**: 🧠 **Collecting Data**. We are actively manual trading to build the dataset for the "Meme Coin Psychology" Fine-Tune.


> **Note**: This project is an advanced **AI Control Center**. It allows the user to remotely control their entire PC, infrastructure, and trading bots from any device (Phone/Laptop) via a unified interface.

## 👁️ The Vision: AI Control Center
Nexus Prime is a **Remote Command Interface** for your digital life.
The goal is to provide a secure, centralized dashboard where you can monitor your PC, execute trades, and control AI agents (like OpenClaw) from anywhere in the world.

## 🧱 The Hybrid Architecture
The system is built as a distributed "God Container" swarm where **OpenClaw is the Muscle** and **Nexus Dashboard is the Brain**.

1.  **Frontend (Mission Control)**: A Cyberpunk/Glassmorphism dashboard (React + Vite) to monitor the hive mind. **Running at `http://localhost:8091`**.
2.  **The Muscle (OpenClaw)**: An integrated tool for heavy automation (Browser/Terminal) that the 'Operator' agent controls.
3.  **Backend (The Hive)**: FastAPI + Google ADK agents that orchestrate the swarm logic.
4.  **Erebus Container**: The isolated environment where the AI executes "unsafe" or autonomous actions.

---

## ⚔️ OpenClaw Integration ("The Muscle")
We have pivoted from brittle Python scripts to **OpenClaw** for all "Hands-on-Keyboard" tasks.
> **See [OPENCLAW_INTEGRATION.md](OPENCLAW_INTEGRATION.md) for the full robust architecture.**

*   **Trading**: Replaces `selenium` with computer-vision based UI interaction.
*   **Social**: "Puppets" real Discord/Telegram apps to avoid API bans.
*   **Erebus**: Operates inside the sandbox for safe file detonation.

---

## 🔮 Roadmap: The Resurrection (Q1 2026)
We are actively restoring the "Soul" of the machine from legacy blueprints:

1.  **Voice Core (`console-pod`)**:
    *   **Ears**: `openai-whisper` (Local STT).
    *   **Mouth**: `kokoro-onnx` (High-quality local TTS).
2.  **Security Core**:
    *   Replacing legacy LFM models with **DeepSeek-R1-Distill** for log analysis.
3.  **Logic Core**:
    *   Resurrecting `wallet_manager.py` and `risk.py` from the legacy brain to guide OpenClaw.

---

## 🤖 The Swarm Agents

| Agent | Role | Status |
| :--- | :--- | :--- |
| **Nexus (Manager)** | The orchestrator. Decides which agent handles which task. | 🟢 Active |
| **Architect** | Software Engineer. Writes code and builds workflows. | 🟢 Active |
| **SocialAgent** | manages X (Twitter) and Discord presence. | 🟢 Active |
| **Operator** | **The OpenClaw Controller**. Uses OpenClaw to browse/execute. | 🟡 Upgrading |
| **Trader** | Crypto trading bot (Solana/Jito). | 🔴 Planned |

---

## 🛠️ Installation & Setup

### 1. Launch the Backend (The Swarm)
```bash
cd backend
cp .env.example .env  # Configure your keys!
docker compose up -d
```

### 2. Launch Mission Control (Frontend)
```bash
cd frontend
npm install
npm run dev
```

### 🛡️ Safety Protocols
*   **No Cloud Keys**: Private keys live in RAM or `.env` only.
*   **Sandboxing**: All execution happens in Docker.
*   **Kill Switch**: The Dashboard "Red Button" instantly kills the swarm.
*   **JWT Sniffing**: We do not sniff sessions. We use official APIs where possible, or user-approved browser automation.
