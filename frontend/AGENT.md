# 🛡️ NEXUS DASHBOARD: Agent Handbook
> **Last Updated**: 2026-01-12 22:00 EST  
> **Scope**: `/projects/tools/nexus/dashboard` + `/Nexus_Connector`  
> **Role**: You are the **Nexus Dashboard Engineer**.

---

## 🚨 ABSOLUTE RULES (MUST FOLLOW)

1. **Always update `AGENT.md`** after making ANY changes to the dashboard.
2. **Always update `autobug.md`** when you encounter or fix a bug.
3. **No Mock Data** in production pages. Use real API calls or mark clearly as `[MOCK]`.
4. **Visual Proof Required**: Screenshot or browser test before marking UI changes complete.
5. **Preserve Future Plans**: Never delete planned features, only update their status.
6. **Docker-First**: Run dev tools inside containers, not on host.
7. **AMD Native**: Use `rocm-smi` for GPU. Nvidia is fallback only.
8. **Scribe Duty**: Document changes in handoff docs.

---

## 📂 FILE LOCATIONS (Complete Map)

### Frontend Dashboard
```
/home/anon/AI work/anon/projects/tools/nexus/dashboard/
├── src/
│   ├── pages/                    # Route Pages
│   │   ├── MissionControl.tsx    # Main dashboard (95% REAL)
│   │   ├── Factory.tsx           # ComfyUI image gen (90% REAL)
│   │   ├── Workflow.tsx          # n8n integration (70% REAL)
│   │   ├── Intelligence.tsx      # Event stream (80% REAL)
│   │   ├── Memory.tsx            # [VERIFIED - Combined Archive + Active Swarm Thoughts]
│   │   ├── TradingFloor.tsx      # [VERIFIED - Live TradingView Chart]
│   │   ├── Analytics.tsx         # [PLACEHOLDER]
│   │   ├── Erebus.tsx            # [VERIFIED - Live File Browser]
│   │   └── Settings.tsx          # [VERIFIED - Wired to Config API]
│   ├── hooks/                    # API Hooks
│   │   ├── useAgent.ts           # WebSocket chat (REAL)
│   │   ├── useContainers.ts      # Docker management (REAL)
│   │   ├── useMetrics.ts         # GPU/CPU/RAM (REAL)
│   │   ├── useComfyUI.ts         # Image generation (REAL)
│   │   ├── useN8n.ts             # Workflow API (REAL)
│   │   ├── useCryptoPrices.ts    # CoinGecko (REAL)
│   │   ├── useWalletBalances.ts  # Chain RPCs (REAL)
│   │   ├── useHealth.ts          # Service status (REAL)
│   │   ├── useIntelligence.ts    # Event stream (REAL)
│   │   └── useSystemLogs.ts      # Container logs (REAL)
│   ├── components/nexus/         # Custom Components (12 files)
│   │   ├── AgentChat.tsx         # Chat + Voice (REAL)
│   │   ├── PodCard.tsx           # Container cards
│   │   ├── GlowingCard.tsx       # Glassmorphism wrapper
│   │   └── CircularGauge.tsx     # Metric gauges
│   └── components/ui/            # Shadcn UI (49 files)
├── AGENT.md                      # THIS FILE
├── README.md                     # Setup instructions
└── vite.config.ts                # Dev on port 8080
```

### Backend API
```
/home/anon/AI work/anon/projects/tools/Nexus_Connector/
├── backend/
│   ├── main.py                   # FastAPI (45+ endpoints, port 8080)
│   ├── agents.py                 # ADK 1.22.0 Swarm (4 agents)
│   ├── vram_manager.py           # VRAM orchestration
│   ├── metrics.py                # AMD/Nvidia GPU stats
│   ├── pg_session_service.py     # PostgreSQL sessions
│   ├── reflection.py             # Self-healing loop
│   └── architect_tools.py        # Workflow generation
├── config/
│   └── agent_models.yaml         # Model assignments
├── workflows/
│   └── architect_generated/      # n8n JSONs
└── mcp/
    └── configs/                  # MCP tool configs
```

### RAG Documentation
```
/home/anon/AI work/anon/rag/docs/
├── ADK_HANDOFF.md                # Master handoff (29KB)
├── NEXUS_PRD_V1.md               # Phase 4 PRD
├── PRD_PHASE_4_SWARM.md          # Swarm PRD
├── NEXUS_MANUAL.md               # Operations manual
└── gpu_container_guide.md        # VRAM management
```

---

## 🔌 PORTS & SERVICES

| Service | Internal | External | URL |
|---------|----------|----------|-----|
| Dashboard | 8081 | **8091** | http://localhost:8091 |
| Backend API | 8080 | **8090** | http://localhost:8090 |
| Ticket API | 8080 | **8090** | http://localhost:8090/tickets |
| WebSocket | 8080 | **8090** | ws://localhost:8090/ws/chat |
| n8n | 5678 | 5678 | http://localhost:5678 |
| ComfyUI | 8188 | 8188 | http://localhost:8188 |
| Ollama | 11434 | 11434 | http://localhost:11434 |
| PostgreSQL | 5432 | 5432 | postgres://localhost:5432 |

---

## 🤖 OLLAMA MODELS (Available)

| Model | Size | Role | Status |
|-------|------|------|--------|
| `qwen3:8b` | 5.2GB | Manager | ✅ Active |
| `deepseek-r1:14b` | 9GB | Architect (Coder) | ✅ Active |
| `qwen3-vl:8b` | 6.1GB | Operator (Vision) | ✅ Loaded |
| `granite3.3:8b` | 4.9GB | Auditor | ✅ Loaded |
| `gpt-oss-safeguard:20b` | 13GB | Gatekeeper | ✅ Available |
| `llama3.2:1b` | 1.3GB | Sentinel | ✅ Active |
| `ministral-3:8b` | 6GB | Alt Manager | ✅ Loaded |

---

## ✅ WHAT'S REAL (Verified Working)

| Page/Feature | Status | Backend Source |
|--------------|--------|----------------|
| MissionControl | 100% | Docker SDK, `/metrics`, **Smart Start** |
| GPS/CPU/RAM Gauges | ✅ | `useMetrics` → `/metrics` |
| Container Management | ✅ | `useContainers`, **Smart Start** |
| Factory (ComfyUI) | 100% | `useComfyUI`, **Smart Mode (Agentic)** |
| Image Generation | ✅ | `/comfyui/queue`, `/comfyui/prompt` |
| Factory History | ✅ | localStorage + **Delete Action** |
| Factory Image Upload | ✅ | UI complete, backend wired |
| Workflow (n8n) | 80% | `useN8n` → `/n8n/workflows` |
| Trigger Workflows | ✅ | `/n8n/webhook/{path}` |
| Smart Logic Logic | ✅ | `/workflow/trigger` (Qwen VL) |
| Intelligence Events | 80% | `useIntelligence` → `/events` |
| Terry Ticket System | ✅ 90% | `useTickets` → `/tickets` (Incident Management) |
| AgentChat | ✅ | WebSocket `/ws/chat` |
| Voice Input | ✅ | Browser `webkitSpeechRecognition` |
| Voice Output (TTS) | ✅ | Browser `SpeechSynthesis` |
| Crypto Prices | ✅ | CoinGecko API |
| Wallet Balances | ✅ | Chain RPCs |

---

## ❌ WHAT'S FAKE (Needs Fix)

| Page/Feature | Status | Frontend Source | Fix Required |
|--------------|--------|-----------------|--------------|
| The Factory | ⚠️ REAL | `Factory.tsx` + `backend/main.py` | [PARTIAL] Backend Hardening Complete. **Bug**: Generated images do not auto-pop in gallery. |
| Radical (Postgres) | ✅ REAL | `nexus_bus` + `asyncpg` | **Lean Swarm**: Verified performance (136ms P99). |
| Nexus Swarm | 🚧 PENDING | `nexus_bus` + Worker | Generic worker for specialized agents (Social/Trader). |
| Nexus Router | ✅ REAL | `nexus_router.json` | **Omnichannels V5 (Audit)**: "Omni-Beast". Gatekeeper Pattern (Ticket -> Action). Discord/Telegram Failover. |
| Memory (Cards) | 🎭 MOCK | `Memory.tsx` UI | **Placeholders**: Represents Meta-Agents (you & me). Production agents will use this UI once deployed. |
| Memory Vault | ✅ REAL | `Memory.tsx` | [VERIFIED] Persistent PostgreSQL Session Store |
| TradingFloor Chart | ✅ Real | `TradingFloor.tsx` | TradingView Widget Live |
| Whale Radar | ✅ Live | `TradingFloor.tsx` | Backend: `/whale/radar` (Simulated) |
| Fear/Greed Index | ✅ | `useFearGreed.ts` | Fetches from alternative.me |
| Erebus File Browser | ✅ Real | `Erebus.tsx` | Wired to `/files` (Workspace) |
| Erebus Terminal | ✅ | `Erebus.tsx` | Matrix typing effect active |
| Settings Voice Dropdown | ✅ Real | `Settings.tsx` | Wired to `/config` |
| Settings Avatar Dropdown | ✅ Real | `Settings.tsx` | Wired to `/config` |
| Settings VPN Toggle | ✅ Real | `Settings.tsx` | Wired to `/config` |
| Settings Add Connection | ✅ Persisted | `Settings.tsx` | Backend: `/config` (JSON) |
| Workflow Create | ✅ | `Workflow.tsx` | Opens n8n editor |
| Analytics Page | Placeholder | `Analytics.tsx` | Build aggregation |
| Factory img2img | ✅ Wired | `Factory.tsx` | Backend: `/comfyui/upload` (Auth) |

---

## 🎯 CURRENT PRIORITY (Phase 4: Swarm)

### PRD Roadmap
- [x] ADK 1.22.0 Migration
- [x] Docker SDK Integration
- [x] Architect Initialization
- [ ] **Week 1**: n8n templates + Architect validation
- [ ] **Week 2**: Janitor Agent (disk/log cleanup)
- [ ] **Week 3**: Watchdog Agent (self-healing)
- [ ] **Week 4**: Trading Floor real metrics

### Pending Agents
| Agent | Model | Status |
|-------|-------|--------|
| Manager | `qwen3:8b` | ⚠️ Needs testing |
| Architect | `deepseek-r1:14b` | ⚠️ Testing |
| Janitor | `granite3.3:8b` | ❌ Not built |
| Watchdog | `qwen3:8b` | ❌ Not built |

---

## 🚀 FUTURE PLANS (Do Not Delete)

### Trading Floor: Agent Browser
- Replace static chart with **Live Browser View** (VNC/NoVNC)
- Watch agent trade on Axiom.trade in real-time

### Erebus: Real Sandbox
- Wire file browser to `nexus-mcp` container filesystem
- Execute scripts in isolated environment

### Workflows: Self-Evolving (Gen UI)
- Architect agent generates n8n workflows from natural language
- Uses Google ADK Generative UI pattern

### Memory: Swarm Integration
- [x] Merged Swarm Thoughts into Memory Vault
- [ ] Show actual session history from `pg_session_service.py`

### Voice: Whisper Integration
- Replace browser WebSpeech with Whisper WASM for better accuracy
- Currently using `nerd-dictation` on host for global input

---

## 🐛 KNOWN ISSUES

1. **Llama 1B Hallucination**: Sentinel breaks character on creative prompts.
2. **Settings Dropdowns**: Not wired to backend.
3. **Placeholder Agents**: The agents visible in 'Memory' (Antigravity, Roo, etc.) are **Meta-Agent placeholders**. They represent the current development swarm, not the application's production trade/social workers.

## 🔑 API KEYS CONFIGURATION

To enable real data for Whale Radar and other services, add your API keys to the backend environment:

1.  **Edit the `.env` file**:
    ```bash
    nano /projects/tools/Nexus_Connector/.env
    ```
2.  **Add the following keys**:
    ```env
    # Whale Alert (Free Tier available)
    WHALE_ALERT_API_KEY=your_key_here
    
    # CoinGecko Pro (Optional, uses public API by default)
    COINGECKO_API_KEY=your_key_here
    
    # ComfyUI (If authentication is enabled)
    COMFYUI_AUTH_TOKEN=your_token_here
    ```
3.  **Restart the Backend**:
    ```bash
    docker restart nexus-connector
    ```


---

## 🛠️ TECH STACK

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| UI Components | Shadcn/UI, Lucide Icons |
| State | Zustand, React Query |
| Backend | FastAPI, Python 3.12 |
| Orchestrator | Google ADK 1.22.0 |
| LLM | Ollama (Local), OpenRouter (Cloud) |
| Workflows | n8n |
| Image Gen | ComfyUI |
| Database | PostgreSQL |
| Containers | Docker, Docker SDK |

---

## 📝 HANDOFF PROTOCOL

When handing off to next agent:
1. Update this `AGENT.md` with your changes
2. Update `autobug.md` if you hit any bugs
3. Update `ADK_HANDOFF.md` for major architectural changes
4. Take screenshots of UI changes
5. Test in browser before marking complete

---

*End of Agent Handbook*
### NEXUS PRIME: OMNI-BEAST V5 (January 2026 Update)
The Terry Ticket System & Omnichannel Router are live.
- **Router**: V5 \"Omni-Beast\" with Discord/Telegram triggers and failover alerts.
- **Tickets**: Postgres-backed incident system with Dashboard UI (Intelligence page).
- **Verification**: Fully integrated frontend (8091) and backend (8090).
