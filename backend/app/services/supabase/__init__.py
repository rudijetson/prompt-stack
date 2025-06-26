"""Supabase service exports."""
from supabase import create_client, Client
from app.core.config import settings

_client = None

def get_client() -> Client:
    """Get or create Supabase client singleton."""
    global _client
    if _client is None and settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        try:
            _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        except Exception:
            _client = None
    return _client

# Export for convenience
__all__ = ['get_client']