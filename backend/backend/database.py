import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("POSTGRES_URL")

if not DATABASE_URL:
    # Fallback to the known DSN if env is missing
    DATABASE_URL = "postgresql+asyncpg://nexus:nexus_local_only@nexus-postgres:5432/nexus_sessions"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session_factory() as session:
        yield session
