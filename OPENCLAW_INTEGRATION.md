# 🦅 OpenClaw Integration: The New "Hands" of Nexus

> **Status**: **ACTIVE INTEGRATION**
> **Role**: Primary Execution Engine ("The Muscle")
> **Replaces**: `telethon_script.py`, `browser-pod`, `axiom_selenium.py`

## 🧠 The Philosophy
Nexus Prime is the **Brain** (Decision Making, Risk Math, Strategy).
OpenClaw is the **Muscle** (Clicks, Typing, Navigation).
We no longer write fragile Python scripts to click buttons. We send **Instructions** to OpenClaw.

---

## 🏛️ The 4 Pillars of Integration

### 1. 📈 Trading (The Executioner)
*   **Legacy Way**: A 500-line Python script trying to find the "Buy" button on Axiom via XPATH. Breaks every time Axiom updates UI.
*   **OpenClaw Way**:
    *   **Input**: `{"task": "Buy 1 SOL of $Token on Axiom", "risk_check_passed": true}`
    *   **Process**: OpenClaw uses Computer Vision & Accessibility APIs to "See" the UI.
    *   **Safety**: It respects the "Human Speed" limit, preventing ban-hammers.
    *   **Jito Integration**: OpenClaw can interact with Jito-enabled wallets directly in the interface.

### 2. 🛡️ Erebus (The Sandbox Pilot)
*   **The Problem**: Running untrusted AI code on your main PC is dangerous.
*   **The Solution**: OpenClaw runs *inside* the **Erebus Container** (or controls it remotely).
*   **Workflow**:
    1.  Nexus (Brain) downloads a suspicious PDF/Repo.
    2.  Nexus sends it to Erebus.
    3.  OpenClaw opens it, interacts with it, and streams the video back to Dashboard.
    4.  **Zero Risk**: If it's a virus, we just `docker restart erebus`. Your main PC is untouched.

### 3. 🌐 Browsing (The Researcher)
*   **Legacy Way**: `selenium` headless browsers that get blocked by Cloudflare.
*   **OpenClaw Way**: A "Headful" resident browser session.
*   **Capabilities**:
    *   **Login Persistence**: It keeps your Twitter/Discord/ChatGPT sessions active (cookies).
    *   **Deep Research**: "Go to X.com, search for '$SOL', scroll for 5 minutes, summarize sentiment."
    *   **Human Mimicry**: It scrolls, hovers, and pauses like a real human.

### 4. 💬 Social (The Mouth)
*   **Legacy Way**: Use API Keys for Telegram/Discord (Easy to ban, flags account as "Bot").
*   **OpenClaw Way**: **The Puppet**.
*   **Method**: It opens the *actual* Discord/Telegram Desktop App (or Web App).
*   **Action**: It types into the text box and clicks "Send".
*   **Benefit**: To the outside world, **YOU** are typing. 100% Undetectable.

---

## 🛠️ Technical Architecture

### The Handoff Protocol
How does the Python Backend talk to OpenClaw?

```json
// POST /api/openclaw/task
{
  "intent": "TRADE_EXECUTE",
  "priority": "HIGH",
  "payload": {
    "platform": "axiom",
    "action": "buy",
    "amount": "1.0",
    "token_address": "CzLS..."
  },
  "security_clearance": "COUNCIL_APPROVED"
}
```

### The Security Check (The Auditor)
Before sending *any* command to OpenClaw:
1.  **Risk Check**: `risk_manager.py` verifies position size.
2.  **Sentinel Check**: Verifies the target URL/Contract is not a known drainer.
3.  **Human Confirm**: (Optional) Dashboard pops up a "CONFIRM?" modal.
