# Nexus Prime (Erebus) 🚀

The "God Container" for AI Agent Orchestration.

## Structure
- `backend/`: FastAPI Server, ADK Agents, Docker Infrastructure
- `frontend/`: React + Vite Dashboard (Mission Control)
- `workflows/`: n8n Automation Recipes

## Setup
1. Backend: `cd backend && cp backend/.env.example backend/.env`
2. Infrastructure: `docker compose up -d`
3. Frontend: `cd frontend && npm install && npm run dev`

## Security
⚠️ **Do not commit .env files.**
All secrets should be managed via environment variables.
