"""
Capability Matrix Module

Single source of truth for service capabilities across the entire system.
This replaces scattered demo mode checks with a unified capability detection system.
"""

from enum import Enum, auto
from typing import Dict, List, Any, Optional
from app.core.config import settings
from app.core.utils.env import env_bool, is_placeholder


class ServiceStatus(Enum):
    """Service availability status"""
    DEMO = auto()
    PRODUCTION = auto()
    UNKNOWN = auto()


class CapabilityMatrix:
    """
    Central capability detection and management.
    
    This class provides a single source of truth for what services
    are available and in what mode they're running.
    """
    
    def __init__(self):
        """Initialize capability matrix with current configuration"""
        self._capabilities = self._detect_capabilities()
        self._validated = set()  # Track which services have been validated
    
    def _is_valid_key(self, key: Optional[str]) -> bool:
        """Check if an API key is valid (not empty or placeholder)"""
        return bool(key and not is_placeholder(key))
    
    def _detect_capabilities(self) -> Dict[str, ServiceStatus]:
        """
        Detect available capabilities based on configuration.
        
        Returns:
            Dict mapping service names to their status
        """
        capabilities = {}
        
        # Authentication capability
        if all([
            self._is_valid_key(settings.SUPABASE_URL),
            self._is_valid_key(settings.SUPABASE_ANON_KEY),
            self._is_valid_key(settings.SUPABASE_SERVICE_KEY)
        ]):
            capabilities["auth"] = ServiceStatus.PRODUCTION
        else:
            capabilities["auth"] = ServiceStatus.DEMO
        
        # Database capability (requires Supabase)
        if all([
            self._is_valid_key(settings.SUPABASE_URL),
            self._is_valid_key(settings.SUPABASE_SERVICE_KEY)
        ]):
            # Note: Actual connection test would be done lazily
            capabilities["database"] = ServiceStatus.PRODUCTION
        else:
            capabilities["database"] = ServiceStatus.DEMO
        
        # AI Provider capabilities
        capabilities["openai"] = (
            ServiceStatus.PRODUCTION 
            if self._is_valid_key(settings.OPENAI_API_KEY) 
            else ServiceStatus.DEMO
        )
        
        capabilities["anthropic"] = (
            ServiceStatus.PRODUCTION 
            if self._is_valid_key(settings.ANTHROPIC_API_KEY) 
            else ServiceStatus.DEMO
        )
        
        capabilities["gemini"] = (
            ServiceStatus.PRODUCTION 
            if self._is_valid_key(settings.GEMINI_API_KEY) 
            else ServiceStatus.DEMO
        )
        
        capabilities["deepseek"] = (
            ServiceStatus.PRODUCTION 
            if self._is_valid_key(settings.DEEPSEEK_API_KEY) 
            else ServiceStatus.DEMO
        )
        
        # Payment capabilities
        stripe_configured = all([
            self._is_valid_key(settings.STRIPE_SECRET_KEY),
            self._is_valid_key(settings.STRIPE_WEBHOOK_SECRET)
        ])
        
        lemon_configured = all([
            self._is_valid_key(settings.LEMONSQUEEZY_API_KEY),
            self._is_valid_key(settings.LEMONSQUEEZY_WEBHOOK_SECRET)
        ])
        
        if stripe_configured or lemon_configured:
            capabilities["payments"] = ServiceStatus.PRODUCTION
        else:
            capabilities["payments"] = ServiceStatus.DEMO
        
        # Email capability
        capabilities["email"] = (
            ServiceStatus.PRODUCTION 
            if self._is_valid_key(settings.RESEND_API_KEY) 
            else ServiceStatus.DEMO
        )
        
        # Vector search (uses Supabase pgvector)
        capabilities["vector_search"] = capabilities["database"]
        
        return capabilities
    
    def get_capability(self, service: str) -> ServiceStatus:
        """
        Get the status of a specific service.
        
        Handles forced modes from DEMO_MODE setting:
        - "true" forces all services to DEMO
        - "false" forces all services to PRODUCTION (if configured)
        - "auto" uses detected capabilities
        
        Args:
            service: Name of the service to check
            
        Returns:
            ServiceStatus for the requested service
        """
        # Handle forced modes
        if settings.DEMO_MODE.lower() == "true":
            return ServiceStatus.DEMO
        elif settings.DEMO_MODE.lower() == "false":
            # In forced production mode, only return PRODUCTION if actually configured
            status = self._capabilities.get(service, ServiceStatus.DEMO)
            return status if status == ServiceStatus.PRODUCTION else ServiceStatus.UNKNOWN
        
        # Auto mode - use detected capability
        status = self._capabilities.get(service, ServiceStatus.UNKNOWN)
        
        # Security-first: Unknown services default to DEMO
        if status == ServiceStatus.UNKNOWN:
            return ServiceStatus.DEMO
        
        return status
    
    @property
    def is_demo_mode(self) -> bool:
        """
        Check if the entire system is in demo mode.
        
        Returns True only if ALL services are in DEMO mode.
        """
        # Explicit demo mode
        if settings.DEMO_MODE.lower() == "true":
            return True
        
        # Explicit production mode
        if settings.DEMO_MODE.lower() == "false":
            return False
        
        # Auto mode - check if all services are demo
        return all(
            status == ServiceStatus.DEMO 
            for status in self._capabilities.values()
        )
    
    @property
    def has_real_auth(self) -> bool:
        """Check if real authentication is available"""
        return self.get_capability("auth") == ServiceStatus.PRODUCTION
    
    @property
    def has_real_ai_providers(self) -> bool:
        """Check if any real AI providers are configured"""
        ai_services = ["openai", "anthropic", "gemini", "deepseek"]
        return any(
            self.get_capability(service) == ServiceStatus.PRODUCTION 
            for service in ai_services
        )
    
    @property
    def available_ai_providers(self) -> List[str]:
        """Get list of available AI providers (including demo)"""
        providers = ["demo"]  # Always available
        
        ai_services = {
            "openai": "openai",
            "anthropic": "anthropic", 
            "gemini": "gemini",
            "deepseek": "deepseek"
        }
        
        for service, provider_name in ai_services.items():
            if self.get_capability(service) == ServiceStatus.PRODUCTION:
                providers.append(provider_name)
        
        return providers
    
    def get_status_summary(self) -> Dict[str, Any]:
        """
        Get complete status summary for all services.
        
        Returns:
            Dict with service statuses and system state
        """
        # Determine overall mode
        if settings.DEMO_MODE.lower() == "true":
            mode = "demo (forced)"
        elif settings.DEMO_MODE.lower() == "false":
            mode = "production (forced)"
        elif settings.DEMO_MODE.lower() == "auto":
            mode = "demo" if self.is_demo_mode else "mixed"
        else:
            mode = "auto"  # Default to auto if not specified
        
        return {
            "mode": mode,
            "is_demo": self.is_demo_mode,
            "capabilities": {
                name: status.name.lower() 
                for name, status in self._capabilities.items()
            },
            "features": {
                "authentication": {
                    "enabled": self.has_real_auth,
                    "provider": "supabase" if self.has_real_auth else "demo"
                },
                "ai_providers": {
                    "enabled": self.has_real_ai_providers,
                    "available": self.available_ai_providers
                },
                "payments": {
                    "enabled": self.get_capability("payments") == ServiceStatus.PRODUCTION,
                    "providers": self._get_payment_providers()
                },
                "vector_search": {
                    "enabled": self.get_capability("vector_search") == ServiceStatus.PRODUCTION,
                    "provider": "pgvector" if self.get_capability("vector_search") == ServiceStatus.PRODUCTION else "in_memory"
                }
            }
        }
    
    def _get_payment_providers(self) -> List[str]:
        """Get list of configured payment providers"""
        providers = []
        
        if all([
            self._is_valid_key(settings.STRIPE_SECRET_KEY),
            self._is_valid_key(settings.STRIPE_WEBHOOK_SECRET)
        ]):
            providers.append("stripe")
        
        if all([
            self._is_valid_key(settings.LEMONSQUEEZY_API_KEY),
            self._is_valid_key(settings.LEMONSQUEEZY_WEBHOOK_SECRET)
        ]):
            providers.append("lemon_squeezy")
        
        return providers


# Singleton instance
CAPABILITIES = CapabilityMatrix()

# Convenience exports
CAPS = {
    name: CAPABILITIES.get_capability(name) 
    for name in ["auth", "database", "openai", "anthropic", "gemini", "deepseek", "payments", "email", "vector_search"]
}

IS_DEMO_FULL = CAPABILITIES.is_demo_mode