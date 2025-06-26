from typing import List, Union

from pydantic_settings import BaseSettings
from app.core.utils.env import env_bool


class Settings(BaseSettings):
    """Application settings."""

    # Application
    ENVIRONMENT: str = "development"
    DEMO_MODE: str = "auto"  # Demo mode: "auto", "true", or "false"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000"]

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # LLM
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""

    # Vector Database (pgvector via Supabase)
    # No additional config needed - uses SUPABASE_* credentials
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Lemon Squeezy
    LEMONSQUEEZY_API_KEY: str = ""
    LEMONSQUEEZY_STORE_ID: str = ""
    LEMONSQUEEZY_WEBHOOK_SECRET: str = ""
    LEMONSQUEEZY_MEMBER_DISCOUNT_CODE: str = ""
    
    # Email
    RESEND_API_KEY: str = ""
    
    # Admin Configuration
    ADMIN_EMAILS: Union[List[str], str] = []  # List of emails that should be admins
    
    # Ngrok (for exposing local dev to internet)
    NGROK_AUTHTOKEN: str = ""
    NGROK_API_KEY: str = ""
    NGROK_DOMAIN: str = ""
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_demo_mode(self) -> bool:
        """
        Check if application is running in demo mode.
        
        This supports three modes:
        - "true": Force demo mode
        - "false": Force production mode (requires services to be configured)
        - "auto": Automatically detect based on configuration
        """
        mode = self.DEMO_MODE.lower().strip()
        
        # Explicit demo mode
        if mode == "true":
            return True
        
        # Explicit production mode
        if mode == "false":
            return False
        
        # Auto mode (default) - demo if no real services configured
        # Check if we have any real providers configured
        has_auth = bool(self.SUPABASE_URL and self.SUPABASE_ANON_KEY)
        has_ai = bool(
            self.OPENAI_API_KEY or 
            self.ANTHROPIC_API_KEY or 
            self.GEMINI_API_KEY or 
            self.DEEPSEEK_API_KEY
        )
        
        # If nothing is configured, we're in demo mode
        return not (has_auth or has_ai)


# Initialize settings
settings = Settings()

# Parse CORS origins from comma-separated string if provided that way
if isinstance(settings.CORS_ORIGINS, str):
    # Handle potential issues with quotes and spacing
    origins_str = settings.CORS_ORIGINS.strip()
    if origins_str.startswith('"') and origins_str.endswith('"'):
        origins_str = origins_str[1:-1]
    elif origins_str.startswith("'") and origins_str.endswith("'"):
        origins_str = origins_str[1:-1]

    settings.CORS_ORIGINS = [origin.strip() for origin in origins_str.split(",")]

# Parse ADMIN_EMAILS from comma-separated string if provided that way
if isinstance(settings.ADMIN_EMAILS, str):
    # Handle empty string
    if not settings.ADMIN_EMAILS.strip():
        settings.ADMIN_EMAILS = []
    else:
        # Handle potential issues with quotes and spacing
        emails_str = settings.ADMIN_EMAILS.strip()
        if emails_str.startswith('[') and emails_str.endswith(']'):
            # Handle JSON array format
            import json
            try:
                settings.ADMIN_EMAILS = json.loads(emails_str)
            except:
                # Fall back to comma-separated
                emails_str = emails_str[1:-1]
                settings.ADMIN_EMAILS = [email.strip() for email in emails_str.split(",") if email.strip()]
        else:
            # Simple comma-separated
            if emails_str.startswith('"') and emails_str.endswith('"'):
                emails_str = emails_str[1:-1]
            elif emails_str.startswith("'") and emails_str.endswith("'"):
                emails_str = emails_str[1:-1]
            settings.ADMIN_EMAILS = [email.strip() for email in emails_str.split(",") if email.strip()]
