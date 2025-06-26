"""LLM Service Module"""

from enum import Enum
from typing import Optional
from .llm_service import get_llm_service, LLMServiceFactory, LLMService, LLMResponse


class LLMProvider(Enum):
    """Available LLM providers"""
    DEMO = "demo"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
    DEEPSEEK = "deepseek"


class LLMServiceManager:
    """Manager for LLM services with provider enumeration support"""
    
    def __init__(self):
        self._services = {}
    
    async def generate_text(
        self,
        prompt: str,
        provider: LLMProvider,
        model: Optional[str] = None,
        max_tokens: int = 500,
        temperature: float = 0.7,
        **kwargs
    ) -> dict:
        """Generate text using specified provider"""
        # Handle demo provider specially
        if provider == LLMProvider.DEMO:
            return {
                "text": f"Demo response to: {prompt[:50]}...",
                "model": "demo-model",
                "provider": "demo",
                "usage": {
                    "prompt_tokens": len(prompt.split()),
                    "completion_tokens": 10,
                    "total_tokens": len(prompt.split()) + 10
                }
            }
        
        # Get the service for the provider
        service = get_llm_service(provider.value)
        response = await service.generate_text(
            prompt=prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
        
        return {
            "text": response.text,
            "model": response.model,
            "provider": provider.value,
            "usage": response.usage.dict()
        }
    
    async def create_embedding(
        self,
        text: str,
        provider: LLMProvider,
        model: Optional[str] = None
    ) -> list[float]:
        """Create text embedding using specified provider"""
        # For now, return mock embeddings
        # TODO: Implement real embedding service
        if provider == LLMProvider.OPENAI:
            return [0.1] * 1536
        else:
            return [0.1] * 768
    
    def get_available_providers(self) -> list[dict]:
        """Get list of available providers and their configuration status"""
        from app.core.capabilities import CAPS, ServiceStatus
        
        providers = []
        
        # Always include demo provider
        providers.append({
            "name": "demo",
            "display_name": "Demo Provider",
            "configured": True,
            "models": ["demo-model"]
        })
        
        # Check each real provider
        provider_map = {
            "openai": ("OpenAI", ["gpt-4o-mini", "gpt-4o", "o1-mini", "o1", "o3-mini"]),
            "anthropic": ("Anthropic", ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"]),
            "gemini": ("Google Gemini", ["gemini-pro", "gemini-1.5-pro"]),
            "deepseek": ("DeepSeek", ["deepseek-chat", "deepseek-reasoner"])
        }
        
        for provider_key, (display_name, models) in provider_map.items():
            configured = CAPS.get(provider_key, ServiceStatus.DEMO) == ServiceStatus.PRODUCTION
            providers.append({
                "name": provider_key,
                "display_name": display_name,
                "configured": configured,
                "models": models if configured else []
            })
        
        return providers


# Create singleton instance
llm_service = LLMServiceManager()


__all__ = [
    "llm_service",
    "LLMProvider",
    "LLMService",
    "LLMResponse",
    "LLMServiceFactory",
    "get_llm_service"
]