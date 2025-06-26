from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, Optional
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.llm import llm_service, LLMProvider
from app.api.endpoints.auth import get_current_user
from app.core.config import settings
from app.core.response_utils import success_response, error_response
from app.core.demo import demo_service


router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class GenerateTextRequest(BaseModel):
    prompt: str
    provider: LLMProvider = LLMProvider.OPENAI
    model: Optional[str] = None
    max_tokens: int = 1000
    temperature: float = 0.7


class CreateEmbeddingRequest(BaseModel):
    text: str
    provider: LLMProvider = LLMProvider.OPENAI
    model: Optional[str] = None


@router.get("/providers")
@limiter.limit("10/minute")
async def get_providers(request: Request):
    """Get list of available LLM providers and their status"""
    providers = llm_service.get_available_providers()
    return success_response(
        data={
            "providers": providers,
            "demo_mode": demo_service.is_demo_mode(settings.SUPABASE_URL, settings.OPENAI_API_KEY, settings.DEMO_MODE)
        }
    )


@router.post("/generate")
@limiter.limit("30/minute")
async def generate_text(
    request: Request,
    data: GenerateTextRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate text using specified LLM provider (requires authentication)"""
    try:
        # Force demo mode if configured
        if settings.is_demo_mode:
            data.provider = LLMProvider.DEMO
            
        result = await llm_service.generate_text(
            prompt=data.prompt,
            provider=data.provider,
            model=data.model,
            max_tokens=data.max_tokens,
            temperature=data.temperature
        )
        return success_response(data=result)
    except Exception as e:
        return error_response(error=str(e), status_code=500)


@router.post("/generate-demo")
@limiter.limit("10/minute")
async def generate_text_demo(request: Request, data: GenerateTextRequest):
    """Demo endpoint for text generation (no authentication required)"""
    # Always use demo provider
    result = await llm_service.generate_text(
        prompt=data.prompt,
        provider=LLMProvider.DEMO,
        model="demo",
        max_tokens=data.max_tokens,
        temperature=data.temperature
    )
    return success_response(data=result)


@router.post("/demo")
@limiter.limit("10/minute")
async def demo_generate(request: Request, data: GenerateTextRequest):
    """Demo endpoint for text generation (alias for frontend compatibility)"""
    # Allow using real providers if they are configured
    if data.provider != LLMProvider.DEMO:
        # Check if the provider is actually configured
        providers = llm_service.get_available_providers()
        provider_dict = {p['name']: p for p in providers}
        
        if data.provider.value in provider_dict and provider_dict[data.provider.value]['configured']:
            # Use the real provider
            result = await llm_service.generate_text(
                prompt=data.prompt,
                provider=data.provider,
                model=data.model,
                max_tokens=data.max_tokens,
                temperature=data.temperature
            )
        else:
            # Fall back to demo
            result = await llm_service.generate_text(
                prompt=data.prompt,
                provider=LLMProvider.DEMO,
                model="demo",
                max_tokens=data.max_tokens,
                temperature=data.temperature
            )
    else:
        # Use demo provider
        result = await llm_service.generate_text(
            prompt=data.prompt,
            provider=LLMProvider.DEMO,
            model="demo",
            max_tokens=data.max_tokens,
            temperature=data.temperature
        )
    return success_response(data=result)


@router.post("/embedding")
async def create_embedding(
    request: CreateEmbeddingRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create text embedding (requires authentication)"""
    try:
        embedding = await llm_service.create_embedding(
            text=request.text,
            provider=request.provider,
            model=request.model
        )
        return {
            "provider": request.provider,
            "model": request.model,
            "embedding": embedding,
            "dimension": len(embedding)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embedding-demo")
async def create_embedding_demo(request: CreateEmbeddingRequest):
    """Demo endpoint for embeddings (no authentication required)"""
    # Return a mock embedding
    mock_dimension = 1536 if request.provider == LLMProvider.OPENAI else 768
    return {
        "provider": request.provider,
        "model": request.model or "demo-embedding-model",
        "embedding": [0.1] * mock_dimension,  # Mock embedding vector
        "dimension": mock_dimension,
        "demo": True
    }