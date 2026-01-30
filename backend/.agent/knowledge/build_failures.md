### 1. Intelligence Page: ReferenceError: pendingTickets is not defined
- **Description**: The dashboard crashed when opening the Intelligence page because `pendingTickets` and `updateTicket` were used in the JSX but not imported/defined from `useTickets`.
- **Status**: ✅ FIXED. Added `useTickets` hook and initialization in `Intelligence.tsx`.

### 2. Ticket API 404
- **Description**: Dashboard attempted to fetch from `http://localhost:8090/tickets` but received a 404.
- **Cause**: Port mismatch or service not restarted.
- **Status**: ✅ FIXED. Restarted `nexus-console` (backend).

### 3. Router Hostname Error (ECONNREFUSED)
- **Description**: n8n Router could not connect to `nexus-connector:8090`.
- **Cause**: Container name mismatch (`nexus-connector` vs `nexus-console`) and internal vs external port usage.
- **Status**: ✅ FIXED. Updated `nexus_router.json` to use `http://nexus-console:8080`.

### 4. Missing Database Table: incident_tickets
- **Description**: Backend logs showed `UndefinedTableError: relation "incident_tickets" does not exist`.
- **Cause**: Alembic migration for the new model was not run.
- **Status**: ✅ FIXED. Ran `alembic revision` and `upgrade head` from `/workspace/tools/Nexus_Connector/backend` inside `nexus-console` container.
