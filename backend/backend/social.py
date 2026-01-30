import os
import logging
import tweepy
import requests
import json
from datetime import datetime
from typing import Optional, Dict, Any

logger = logging.getLogger("social_logic")

class SocialManager:
    """
    Unified manager for Social Media interactions (X and Discord).
    Part of the Erebus Omni-Factory Monolith.
    """
    
    def __init__(self):
        # X (Twitter) Credentials
        self.x_consumer_key = os.getenv("X_CONSUMER_KEY")
        self.x_consumer_secret = os.getenv("X_CONSUMER_SECRET")
        self.x_access_token = os.getenv("X_ACCESS_TOKEN")
        self.x_access_token_secret = os.getenv("X_ACCESS_TOKEN_SECRET")
        self.x_bearer_token = os.getenv("X_BEARER_TOKEN")
        
        # Discord Credentials
        self.discord_webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
        self.discord_bot_token = os.getenv("DISCORD_BOT_TOKEN")

        self.x_client = None
        self._init_x_client()

    def _init_x_client(self):
        """Initialize Tweepy Client for X API v2."""
        if all([self.x_consumer_key, self.x_consumer_secret, self.x_access_token, self.x_access_token_secret]):
            try:
                self.x_client = tweepy.Client(
                    bearer_token=self.x_bearer_token,
                    consumer_key=self.x_consumer_key,
                    consumer_secret=self.x_consumer_secret,
                    access_token=self.x_access_token,
                    access_token_secret=self.x_access_token_secret,
                    wait_on_rate_limit=True
                )
                logger.info("✅ X (Twitter) Client Initialized.")
            except Exception as e:
                logger.error(f"❌ Failed to initialize X Client: {e}")
        else:
            logger.warning("⚠️ X (Twitter) credentials incomplete. Social Agent will have limited capabilities.")

    def post_to_x(self, text: str, media_ids: Optional[list] = None) -> Dict[str, Any]:
        """Post a tweet to X."""
        if not self.x_client:
            return {"success": False, "error": "X Client not initialized"}
        
        try:
            response = self.x_client.create_tweet(text=text, media_ids=media_ids)
            logger.info(f"✅ Tweet posted: {response.data['id']}")
            return {"success": True, "tweet_id": response.data['id']}
        except Exception as e:
            logger.error(f"❌ X Post failed: {e}")
            return {"success": False, "error": str(e)}

    def post_to_discord_webhook(self, content: str = None, embed: dict = None) -> Dict[str, Any]:
        """Post to Discord via Webhook."""
        if not self.discord_webhook_url:
            return {"success": False, "error": "Discord Webhook URL not set"}
        
        payload = {}
        if content: payload["content"] = content
        if embed: payload["embeds"] = [embed]
        
        try:
            resp = requests.post(self.discord_webhook_url, json=payload, timeout=10)
            resp.raise_for_status()
            logger.info("✅ Discord Webhook message sent.")
            return {"success": True}
        except Exception as e:
            logger.error(f"❌ Discord Webhook failed: {e}")
            return {"success": False, "error": str(e)}

    def scan_for_secrets(self, data: str) -> bool:
        """Security check for private keys (Solana/EVN)."""
        import re
        # Pattern 1: Base58 string of length 64-88 (Solana secret keys)
        base58_pattern = r'[1-9A-HJ-NP-Za-km-z]{64,88}'
        # Pattern 2: Hex string of exactly 64 chars (256-bit private key)
        hex_pattern = r'[0-9a-fA-F]{64}'
        
        if re.search(base58_pattern, data) or re.search(hex_pattern, data):
            # Additional heuristic: length check for base58
            matches = re.findall(base58_pattern, data)
            if any(len(m) > 50 for m in matches):
                return True
            if re.search(hex_pattern, data):
                return True
        return False

social_manager = SocialManager()

# --- ADK Tool Wrappers ---

async def post_x_tweet(text: str):
    """Tool: Post a new update to X (Twitter)."""
    if social_manager.scan_for_secrets(text):
        return "❌ SECURITY BLOCK: Potential private key detected in tweet."
    result = social_manager.post_to_x(text)
    return "✅ Tweet posted successfully." if result["success"] else f"❌ Error: {result['error']}"

async def post_discord_alert(title: str, message: str, level: str = "info"):
    """Tool: Send an alert to Discord."""
    colors = {"info": 3447003, "success": 3066993, "warning": 16776960, "error": 15158332}
    embed = {
        "title": title,
        "description": message,
        "color": colors.get(level.lower(), 3447003),
        "timestamp": datetime.utcnow().isoformat()
    }
    result = social_manager.post_to_discord_webhook(embed=embed)
    return "✅ Discord alert sent." if result["success"] else f"❌ Error: {result['error']}"
