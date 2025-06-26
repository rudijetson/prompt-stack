"""
Vector database service factory.
Uses Supabase pgvector when configured, falls back to demo mode.
"""

import logging
from typing import Union

from app.core.config import settings

logger = logging.getLogger(__name__)

# Type alias for vector service
VectorService = Union['SupabaseVectorService']


def get_vector_service() -> VectorService:
    """
    Get the appropriate vector service based on configuration.
    
    Uses Supabase pgvector if configured, otherwise returns demo mode.
    
    Returns:
        Vector service instance
    """
    # Always use Supabase vector service (it has demo mode built in)
    from app.services.vectordb.supabase_vector_service import get_vector_service as get_supabase_service
    
    if settings.SUPABASE_URL and settings.SUPABASE_URL != "":
        logger.info("Using Supabase pgvector for vector database")
    else:
        logger.info("Using demo vector database (in-memory)")
    
    return get_supabase_service()


__all__ = ['get_vector_service', 'VectorService']