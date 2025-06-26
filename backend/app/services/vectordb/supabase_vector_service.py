"""
Supabase pgvector service for vector database operations.
Replaces Qdrant with Supabase's built-in pgvector extension.
"""

import json
import logging
from typing import List, Optional, Dict, Any
from uuid import uuid4

import numpy as np
from supabase import Client

from app.core.config import settings
from app.models.vectordb import Document, SearchQuery, SearchResult
from app.services.supabase import get_client as get_supabase_client
from app.services.llm.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class SupabaseVectorService:
    """Service for managing vector embeddings using Supabase pgvector."""
    
    def __init__(self):
        """Initialize Supabase vector service."""
        self.supabase: Client = get_supabase_client()
        self.embedding_service = EmbeddingService()
        self.embedding_dimension = 1536  # OpenAI embedding size
        
    async def ensure_table_exists(self) -> None:
        """Ensure the embeddings table exists (should be created via migration)."""
        try:
            # Try to select from the table to verify it exists
            result = self.supabase.table('embeddings').select('id').limit(1).execute()
            logger.info("Embeddings table verified")
        except Exception as e:
            logger.error(f"Embeddings table not found. Please run migrations: {e}")
            raise Exception(
                "Embeddings table not found. Please run the Supabase setup SQL "
                "from docs/SUPABASE_SETUP_GUIDE.md"
            )
    
    async def add_documents(
        self,
        documents: List[Document],
        user_id: str,
        collection_name: Optional[str] = None
    ) -> List[str]:
        """
        Add documents with their embeddings to Supabase.
        
        Args:
            documents: List of documents to add
            user_id: ID of the user adding documents
            collection_name: Optional collection name (stored in metadata)
            
        Returns:
            List of document IDs
        """
        await self.ensure_table_exists()
        
        doc_ids = []
        
        for doc in documents:
            # Generate embedding
            embedding = await self.embedding_service.get_embedding(
                doc.text,
                model=doc.embedding_model
            )
            
            # Prepare metadata
            metadata = doc.metadata or {}
            metadata['title'] = doc.title
            if collection_name:
                metadata['collection'] = collection_name
            
            # Convert embedding to list for JSON serialization
            embedding_list = embedding.tolist() if isinstance(embedding, np.ndarray) else embedding
            
            # Insert into Supabase
            try:
                result = self.supabase.table('embeddings').insert({
                    'user_id': user_id,
                    'content': doc.text,
                    'embedding': embedding_list,
                    'metadata': metadata
                }).execute()
                
                doc_ids.append(result.data[0]['id'])
                logger.info(f"Added document {result.data[0]['id']}")
                
            except Exception as e:
                logger.error(f"Failed to add document: {e}")
                raise
        
        return doc_ids
    
    async def search(
        self,
        query: SearchQuery,
        user_id: str,
        collection_name: Optional[str] = None
    ) -> List[SearchResult]:
        """
        Search for similar documents using vector similarity.
        
        Args:
            query: Search query with text and parameters
            user_id: ID of the user searching
            collection_name: Optional collection to search in
            
        Returns:
            List of search results with similarity scores
        """
        await self.ensure_table_exists()
        
        # Generate query embedding
        query_embedding = await self.embedding_service.get_embedding(
            query.query,
            model=query.embedding_model
        )
        
        # Convert to list for RPC call
        embedding_list = query_embedding.tolist() if isinstance(query_embedding, np.ndarray) else query_embedding
        
        # Prepare filter
        filter_metadata = query.filter or {}
        if collection_name:
            filter_metadata['collection'] = collection_name
        
        try:
            # Call the match_embeddings function via RPC
            result = self.supabase.rpc(
                'match_embeddings',
                {
                    'query_embedding': embedding_list,
                    'match_count': query.top_k,
                    'filter': filter_metadata
                }
            ).execute()
            
            # Convert results to SearchResult objects
            search_results = []
            for item in result.data:
                # Extract title from metadata if available
                metadata = item.get('metadata', {})
                title = metadata.pop('title', 'Untitled')
                
                search_results.append(SearchResult(
                    id=item['id'],
                    score=item['similarity'],
                    document=Document(
                        text=item['content'],
                        title=title,
                        metadata=metadata
                    )
                ))
            
            logger.info(f"Found {len(search_results)} results for query")
            return search_results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
    
    async def delete(
        self,
        ids: List[str],
        user_id: str,
        collection_name: Optional[str] = None
    ) -> List[str]:
        """
        Delete documents by IDs.
        
        Args:
            ids: List of document IDs to delete
            user_id: ID of the user deleting documents
            collection_name: Optional collection filter
            
        Returns:
            List of deleted document IDs
        """
        await self.ensure_table_exists()
        
        deleted_ids = []
        
        for doc_id in ids:
            try:
                # Build delete query
                query = self.supabase.table('embeddings').delete().eq('id', doc_id)
                
                # Add collection filter if specified
                if collection_name:
                    query = query.eq('metadata->>collection', collection_name)
                
                # Execute delete (RLS will ensure user owns the document)
                result = query.execute()
                
                if result.data:
                    deleted_ids.append(doc_id)
                    logger.info(f"Deleted document {doc_id}")
                else:
                    logger.warning(f"Document {doc_id} not found or not authorized")
                    
            except Exception as e:
                logger.error(f"Failed to delete document {doc_id}: {e}")
        
        return deleted_ids
    
    async def get_collections(self, user_id: str) -> List[str]:
        """
        Get list of collections for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of collection names
        """
        await self.ensure_table_exists()
        
        try:
            # Query distinct collection names from metadata
            result = self.supabase.table('embeddings')\
                .select('metadata->>collection')\
                .eq('user_id', user_id)\
                .execute()
            
            # Extract unique collection names
            collections = set()
            for item in result.data:
                collection = item.get('collection')
                if collection:
                    collections.add(collection)
            
            return list(collections)
            
        except Exception as e:
            logger.error(f"Failed to get collections: {e}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check if the vector service is healthy.
        
        Returns:
            Health status dictionary
        """
        try:
            await self.ensure_table_exists()
            
            # Try a simple count query
            result = self.supabase.table('embeddings').select('id', count='exact').limit(1).execute()
            
            return {
                "status": "healthy",
                "service": "supabase_pgvector",
                "table_exists": True,
                "embedding_dimension": self.embedding_dimension
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "service": "supabase_pgvector",
                "error": str(e)
            }


# Create a singleton instance
_vector_service: Optional[SupabaseVectorService] = None


def get_vector_service() -> SupabaseVectorService:
    """Get or create the vector service instance."""
    global _vector_service
    if _vector_service is None:
        _vector_service = SupabaseVectorService()
    return _vector_service