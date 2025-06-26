"""
LLM Model Configuration
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


class ModelInfo(BaseModel):
    """Information about an LLM model."""
    id: str
    name: str
    provider: str
    description: str
    context_window: int
    max_output_tokens: Optional[int] = None
    supports_functions: bool = False
    supports_vision: bool = False


# Model configurations
MODELS: Dict[str, ModelInfo] = {
    # OpenAI Models
    "gpt-4o": ModelInfo(
        id="gpt-4o",
        name="GPT-4o",
        provider="openai",
        description="Most capable GPT-4 model with vision",
        context_window=128000,
        max_output_tokens=4096,
        supports_functions=True,
        supports_vision=True
    ),
    "gpt-4o-mini": ModelInfo(
        id="gpt-4o-mini",
        name="GPT-4o Mini",
        provider="openai",
        description="Affordable small model for simple tasks",
        context_window=128000,
        max_output_tokens=16384,
        supports_functions=True,
        supports_vision=True
    ),
    
    # Anthropic Models
    "claude-3-5-sonnet": ModelInfo(
        id="claude-3-5-sonnet-20241022",
        name="Claude 3.5 Sonnet",
        provider="anthropic",
        description="Most intelligent Claude model",
        context_window=200000,
        max_output_tokens=8192,
        supports_functions=True,
        supports_vision=True
    ),
    "claude-3-haiku": ModelInfo(
        id="claude-3-haiku-20240307",
        name="Claude 3 Haiku",
        provider="anthropic",
        description="Fastest Claude model for simple queries",
        context_window=200000,
        max_output_tokens=4096,
        supports_functions=True,
        supports_vision=True
    ),
    
    # Google Models
    "gemini-2.5-pro": ModelInfo(
        id="gemini-2.5-pro",
        name="Gemini 2.5 Pro",
        provider="gemini",
        description="Most capable Gemini model with advanced reasoning",
        context_window=2000000,
        max_output_tokens=8192,
        supports_functions=True,
        supports_vision=True
    ),
    "gemini-2.5-flash": ModelInfo(
        id="gemini-2.5-flash",
        name="Gemini 2.5 Flash",
        provider="gemini",
        description="Latest and fastest multimodal model",
        context_window=1000000,
        max_output_tokens=8192,
        supports_functions=True,
        supports_vision=True
    ),
    "gemini-2.0-flash": ModelInfo(
        id="gemini-2.0-flash",
        name="Gemini 2.0 Flash",
        provider="gemini",
        description="Fast multimodal model",
        context_window=1000000,
        max_output_tokens=8192,
        supports_functions=True,
        supports_vision=True
    ),
    "gemini-1.5-pro": ModelInfo(
        id="gemini-1.5-pro",
        name="Gemini 1.5 Pro",
        provider="gemini",
        description="Advanced reasoning across modalities",
        context_window=2000000,
        max_output_tokens=8192,
        supports_functions=True,
        supports_vision=True
    ),
    "gemini-1.5-flash": ModelInfo(
        id="gemini-1.5-flash",
        name="Gemini 1.5 Flash",
        provider="gemini",
        description="Fast and versatile multimodal model",
        context_window=1000000,
        max_output_tokens=8192,
        supports_functions=True,
        supports_vision=True
    ),
    
    # DeepSeek Models
    "deepseek-chat": ModelInfo(
        id="deepseek-chat",
        name="DeepSeek Chat",
        provider="deepseek",
        description="DeepSeek's chat model",
        context_window=32768,
        max_output_tokens=4096,
        supports_functions=True,
        supports_vision=False
    ),
    "deepseek-coder": ModelInfo(
        id="deepseek-coder",
        name="DeepSeek Coder",
        provider="deepseek",
        description="Specialized model for code generation",
        context_window=32768,
        max_output_tokens=4096,
        supports_functions=True,
        supports_vision=False
    ),
    
    # Demo Model
    "demo": ModelInfo(
        id="demo",
        name="Demo Model",
        provider="demo",
        description="Mock model for demo mode",
        context_window=8192,
        max_output_tokens=1024,
        supports_functions=False,
        supports_vision=False
    )
}


def get_model_info(model_id: str) -> Optional[ModelInfo]:
    """Get information about a specific model."""
    return MODELS.get(model_id)


def get_models_by_provider(provider: str) -> List[ModelInfo]:
    """Get all models for a specific provider."""
    return [model for model in MODELS.values() if model.provider == provider]


def get_all_models() -> List[ModelInfo]:
    """Get all available models."""
    return list(MODELS.values())


def is_model_available(model_id: str, api_keys: Dict[str, Optional[str]]) -> bool:
    """Check if a model is available based on API keys."""
    model = MODELS.get(model_id)
    if not model:
        return False
    
    if model.provider == "demo":
        return True
    
    provider_key_map = {
        "openai": "OPENAI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "gemini": "GEMINI_API_KEY",
        "deepseek": "DEEPSEEK_API_KEY"
    }
    
    required_key = provider_key_map.get(model.provider)
    return bool(api_keys.get(required_key)) if required_key else False


# Default models for different tasks
DEFAULT_MODELS = {
    "general": "gpt-4o-mini",
    "complex": "gpt-4o",
    "vision": "gpt-4o",
    "fast": "claude-3-haiku",
    "demo": "demo",
    # Provider-specific defaults
    "openai": "gpt-4o-mini",
    "anthropic": "claude-3-5-sonnet-20241022",
    "gemini": "gemini-2.5-flash",
    "deepseek": "deepseek-chat"
}


def get_model_for_task(task: str = "general") -> str:
    """Get the default model for a specific task."""
    return DEFAULT_MODELS.get(task, DEFAULT_MODELS["general"])