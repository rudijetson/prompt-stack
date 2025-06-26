from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class Document(BaseModel):
    """Document to be stored in the vector database."""

    text: str
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    embedding_model: Optional[str] = "text-embedding-ada-002"


class DocumentInput(BaseModel):
    """Input for adding documents to the vector database."""

    documents: List[Document]
    embedding_model: str = "text-embedding-ada-002"


class DocumentUploadResponse(BaseModel):
    """Response from adding documents to the vector database."""

    document_ids: List[str]


class SearchQuery(BaseModel):
    """Query for searching the vector database."""

    query: str  # Changed from query_text to match new interface
    embedding_model: str = "text-embedding-ada-002"
    top_k: int = Field(default=10, gt=0, le=100)  # Changed from limit to top_k
    filter: Optional[Dict[str, Any]] = None  # Changed from filter_metadata to filter


class SearchResult(BaseModel):
    """Search result from the vector database."""

    id: str
    score: float
    document: Document  # Changed to use Document model


class DeleteDocumentsRequest(BaseModel):
    """Request for deleting documents from the vector database."""

    document_ids: List[str]
