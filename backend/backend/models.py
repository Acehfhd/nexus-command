from sqlalchemy import Column, String, DateTime, Boolean, Enum
from database import Base
from datetime import datetime
import uuid
import enum

class AssetStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DENIED = "denied"

class FactoryAsset(Base):
    __tablename__ = "factory_assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    path = Column(String(512), nullable=False)
    status = Column(Enum(AssetStatus), default=AssetStatus.PENDING)
    locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "path": self.path,
            "status": self.status.value,
            "locked": self.locked,
            "created_at": self.created_at.isoformat()
        }
class TicketSeverity(enum.Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class TicketStatus(enum.Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"

class IncidentTicket(Base):
    __tablename__ = "incident_tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(64), nullable=False) # Dashboard, Discord, Telegram
    severity = Column(Enum(TicketSeverity), default=TicketSeverity.INFO)
    status = Column(Enum(TicketStatus), default=TicketStatus.OPEN)
    description = Column(String(1024), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "severity": self.severity.value,
            "status": self.status.value,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
