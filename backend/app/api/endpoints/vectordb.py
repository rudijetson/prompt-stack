from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

from app.services.vectordb import get_vector_service
from app.services.supabase.auth import SupabaseAuthService, get_auth_service
from app.models.vectordb import (
    DocumentInput, 
    Document,
    SearchQuery, 
    SearchResult, 
    DocumentUploadResponse, 
    DeleteDocumentsRequest
)

router = APIRouter()
security = HTTPBearer()


@router.post("/documents", response_model=DocumentUploadResponse)
async def add_documents(
    request: DocumentInput,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: SupabaseAuthService = Depends(get_auth_service),
    vector_service = Depends(get_vector_service),
):
    """Add documents to the vector database."""
    try:
        # Validate user authentication and get user ID
        user = await auth_service.get_user(credentials.credentials)
        user_id = user.id

        # Convert documents to the expected format
        documents = []
        for doc in request.documents:
            # Update embedding model for each document
            doc.embedding_model = request.embedding_model
            documents.append(doc)

        # Add documents to vector database
        doc_ids = await vector_service.add_documents(
            documents=documents,
            user_id=user_id
        )

        return DocumentUploadResponse(document_ids=doc_ids)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Failed to add documents: {str(e)}"
        )


@router.post("/search", response_model=List[SearchResult])
async def search_documents(
    query: SearchQuery,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: SupabaseAuthService = Depends(get_auth_service),
    vector_service = Depends(get_vector_service),
):
    """Search for documents similar to the query."""
    try:
        # Validate user authentication and get user ID
        user = await auth_service.get_user(credentials.credentials)
        user_id = user.id

        # Search vector database
        results = await vector_service.search(
            query=query,
            user_id=user_id
        )

        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Search failed: {str(e)}"
        )


@router.delete("/documents", status_code=status.HTTP_204_NO_CONTENT)
async def delete_documents(
    request: DeleteDocumentsRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: SupabaseAuthService = Depends(get_auth_service),
    vector_service = Depends(get_vector_service),
):
    """Delete documents from the vector database."""
    try:
        # Validate user authentication and get user ID
        user = await auth_service.get_user(credentials.credentials)
        user_id = user.id

        # Delete documents
        deleted_ids = await vector_service.delete(
            ids=request.document_ids,
            user_id=user_id
        )

        if len(deleted_ids) != len(request.document_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Failed to delete one or more documents"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Document deletion failed: {str(e)}"
        )


@router.get("/health")
async def health_check(
    vector_service = Depends(get_vector_service),
):
    """Check vector database health status."""
    try:
        health = await vector_service.health_check()
        return health
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }