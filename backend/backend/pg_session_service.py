"""
Session Service for ADK 1.22.0
Uses PostgreSQL via DatabaseSessionService for persistence.
"""
import os
from dotenv import load_dotenv
from google.adk.sessions import DatabaseSessionService

# Load env for POSTGRES_URL
load_dotenv()

db_url = os.getenv("POSTGRES_URL", "postgresql+asyncpg://nexus:nexus_local_only@nexus-postgres:5432/nexus_sessions")

# Initialize the persistent session service
session_service = DatabaseSessionService(db_url=db_url)
