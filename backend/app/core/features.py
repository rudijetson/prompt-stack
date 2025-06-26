"""
Centralized feature configuration to avoid scattered demo mode checks
"""
from typing import List, Dict, Any
from app.core.config import settings
from app.core.utils.env import env_bool, is_placeholder


class FeatureConfig:
    """Single source of truth for feature availability"""
    
    @property
    def demo_mode(self) -> bool:
        """Check if system is in demo mode"""
        return env_bool(settings.DEMO_MODE) or not self.has_real_providers
    
    @property
    def has_real_providers(self) -> bool:
        """Check if any real AI providers are configured"""
        return any([
            self._is_valid_key(settings.OPENAI_API_KEY),
            self._is_valid_key(settings.ANTHROPIC_API_KEY),
            self._is_valid_key(settings.GEMINI_API_KEY),
            self._is_valid_key(settings.DEEPSEEK_API_KEY),
        ])
    
    @property
    def has_auth(self) -> bool:
        """Check if real authentication is configured"""
        return all([
            self._is_valid_key(settings.SUPABASE_URL),
            self._is_valid_key(settings.SUPABASE_ANON_KEY),
            self._is_valid_key(settings.SUPABASE_SERVICE_KEY),
        ])
    
    @property
    def has_payments(self) -> bool:
        """Check if payment processing is configured"""
        stripe_configured = all([
            self._is_valid_key(settings.STRIPE_SECRET_KEY),
            self._is_valid_key(settings.STRIPE_WEBHOOK_SECRET),
        ])
        
        lemon_configured = all([
            self._is_valid_key(settings.LEMONSQUEEZY_API_KEY),
            self._is_valid_key(settings.LEMONSQUEEZY_WEBHOOK_SECRET),
        ])
        
        return stripe_configured or lemon_configured
    
    @property
    def has_vector_search(self) -> bool:
        """Check if vector search is configured"""
        return self.has_auth  # Uses Supabase pgvector
    
    @property
    def available_providers(self) -> List[str]:
        """Get list of configured AI providers"""
        providers = ["demo"]  # Always available
        
        if self._is_valid_key(settings.OPENAI_API_KEY):
            providers.append("openai")
        if self._is_valid_key(settings.ANTHROPIC_API_KEY):
            providers.append("anthropic")
        if self._is_valid_key(settings.GEMINI_API_KEY):
            providers.append("gemini")
        if self._is_valid_key(settings.DEEPSEEK_API_KEY):
            providers.append("deepseek")
            
        return providers
    
    @property
    def status_summary(self) -> Dict[str, Any]:
        """Get complete feature status summary"""
        return {
            "demo_mode": self.demo_mode,
            "features": {
                "ai_providers": {
                    "enabled": self.has_real_providers,
                    "available": self.available_providers,
                },
                "authentication": {
                    "enabled": self.has_auth,
                    "provider": "supabase" if self.has_auth else "demo",
                },
                "payments": {
                    "enabled": self.has_payments,
                    "providers": self._get_payment_providers(),
                },
                "vector_search": {
                    "enabled": self.has_vector_search,
                    "provider": "supabase_pgvector" if self.has_vector_search else "in_memory",
                },
            },
            "warnings": self._get_warnings(),
        }
    
    def _is_valid_key(self, key: str) -> bool:
        """Check if an API key is valid (not empty or placeholder)"""
        return bool(key and not is_placeholder(key))
    
    def _get_payment_providers(self) -> List[str]:
        """Get list of configured payment providers"""
        providers = []
        
        if all([
            self._is_valid_key(settings.STRIPE_SECRET_KEY),
            self._is_valid_key(settings.STRIPE_WEBHOOK_SECRET),
        ]):
            providers.append("stripe")
            
        if all([
            self._is_valid_key(settings.LEMONSQUEEZY_API_KEY),
            self._is_valid_key(settings.LEMONSQUEEZY_WEBHOOK_SECRET),
        ]):
            providers.append("lemon_squeezy")
            
        return providers
    
    def _get_warnings(self) -> List[str]:
        """Get configuration warnings"""
        warnings = []
        
        if self.demo_mode:
            warnings.append("System running in DEMO mode - no API keys configured")
            
        if not self.has_auth:
            warnings.append("Authentication not configured - using demo auth")
            
        if not self.has_real_providers:
            warnings.append("No AI providers configured - using demo responses")
            
        if settings.ENVIRONMENT == "production" and self.demo_mode:
            warnings.append("⚠️ Production environment but running in demo mode!")
            
        return warnings


# Singleton instance
features = FeatureConfig()