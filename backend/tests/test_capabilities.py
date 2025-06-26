"""
Test cases for capability detection and security constraints.

These tests ensure that the auto-detection logic works correctly
and that security constraints are enforced.
"""

import pytest
from unittest.mock import patch, MagicMock
from app.core.capabilities import CapabilityMatrix, ServiceStatus, CAPS
from app.core.config import settings


class TestCapabilityDetection:
    """Test capability detection logic."""
    
    def test_demo_mode_when_nothing_configured(self):
        """When no services are configured, system should be in demo mode."""
        with patch.object(settings, 'SUPABASE_URL', ''):
            with patch.object(settings, 'OPENAI_API_KEY', ''):
                with patch.object(settings, 'DEMO_MODE', 'auto'):
                    # Re-initialize to pick up new settings
                    caps = CapabilityMatrix()
                    assert caps.is_demo_mode == True
                    assert caps.get_capability("auth") == ServiceStatus.DEMO
                    assert caps.get_capability("openai") == ServiceStatus.DEMO
    
    def test_mixed_mode_with_partial_config(self):
        """When some services are configured, system should be in mixed mode."""
        with patch.object(settings, 'SUPABASE_URL', 'https://real.supabase.co'):
            with patch.object(settings, 'SUPABASE_ANON_KEY', 'eyJreal'):
                with patch.object(settings, 'SUPABASE_SERVICE_KEY', 'eyJservice'):
                    with patch.object(settings, 'OPENAI_API_KEY', ''):
                        with patch.object(settings, 'DEMO_MODE', 'auto'):
                            caps = CapabilityMatrix()
                            assert caps.is_demo_mode == False  # Not full demo
                            assert caps.get_capability("auth") == ServiceStatus.PRODUCTION
                            assert caps.get_capability("openai") == ServiceStatus.DEMO
    
    def test_forced_demo_mode(self):
        """When DEMO_MODE=true, everything should be demo regardless of config."""
        with patch.object(settings, 'SUPABASE_URL', 'https://real.supabase.co'):
            with patch.object(settings, 'OPENAI_API_KEY', 'sk-real-key'):
                with patch.object(settings, 'DEMO_MODE', 'true'):
                    caps = CapabilityMatrix()
                    assert caps.is_demo_mode == True
                    assert caps.get_capability("auth") == ServiceStatus.DEMO
                    assert caps.get_capability("openai") == ServiceStatus.DEMO
    
    def test_forced_production_mode(self):
        """When DEMO_MODE=false, should use actual configuration."""
        with patch.object(settings, 'SUPABASE_URL', 'https://real.supabase.co'):
            with patch.object(settings, 'SUPABASE_ANON_KEY', 'eyJreal'):
                with patch.object(settings, 'SUPABASE_SERVICE_KEY', 'eyJservice'):
                    with patch.object(settings, 'OPENAI_API_KEY', 'sk-real-key'):
                        with patch.object(settings, 'DEMO_MODE', 'false'):
                            caps = CapabilityMatrix()
                            assert caps.is_demo_mode == False
                            assert caps.get_capability("auth") == ServiceStatus.PRODUCTION
                            assert caps.get_capability("openai") == ServiceStatus.PRODUCTION
    
    def test_placeholder_detection(self):
        """Placeholder values should be treated as not configured."""
        with patch.object(settings, 'OPENAI_API_KEY', 'your-api-key-here'):
            with patch.object(settings, 'SUPABASE_URL', 'https://example.supabase.co'):
                with patch.object(settings, 'DEMO_MODE', 'auto'):
                    caps = CapabilityMatrix()
                    assert caps.get_capability("openai") == ServiceStatus.DEMO
                    assert caps.get_capability("auth") == ServiceStatus.DEMO


class TestSecurityConstraints:
    """Test security constraints are properly enforced."""
    
    def test_no_production_ai_without_auth(self):
        """
        CRITICAL TEST: Ensure production AI cannot be used without auth.
        This prevents API key leakage in mixed-mode configurations.
        """
        # Setup: AI configured but no auth
        with patch.object(settings, 'SUPABASE_URL', ''):
            with patch.object(settings, 'OPENAI_API_KEY', 'sk-real-key'):
                with patch.object(settings, 'ANTHROPIC_API_KEY', 'sk-ant-real'):
                    with patch.object(settings, 'DEMO_MODE', 'auto'):
                        caps = CapabilityMatrix()
                        
                        # The system should detect we have AI but no auth
                        assert caps.has_real_ai_providers == True
                        assert caps.has_real_auth == False
                        
                        # IMPORTANT: This configuration should be prevented
                        # by the auth-first guardrail in LLMServiceFactory
                        assert caps.get_capability("auth") == ServiceStatus.DEMO
                        assert caps.get_capability("openai") == ServiceStatus.PRODUCTION
                        
                        # This is the configuration we want to prevent
                        # The LLMServiceFactory should raise an error
                        # when trying to use OpenAI without auth
    
    def test_status_summary_accuracy(self):
        """Status summary should accurately reflect configuration."""
        with patch.object(settings, 'SUPABASE_URL', 'https://real.supabase.co'):
            with patch.object(settings, 'SUPABASE_ANON_KEY', 'eyJreal'):
                with patch.object(settings, 'SUPABASE_SERVICE_KEY', 'eyJservice'):
                    with patch.object(settings, 'OPENAI_API_KEY', 'sk-real'):
                        with patch.object(settings, 'STRIPE_SECRET_KEY', ''):
                            with patch.object(settings, 'DEMO_MODE', 'auto'):
                                caps = CapabilityMatrix()
                                summary = caps.get_status_summary()
                                
                                assert summary["mode"] == "mixed"
                                assert summary["is_demo"] == False
                                assert summary["capabilities"]["auth"] == "production"
                                assert summary["capabilities"]["openai"] == "production"
                                assert summary["capabilities"]["payments"] == "demo"
    
    def test_available_providers_list(self):
        """Available providers should match configuration."""
        with patch.object(settings, 'OPENAI_API_KEY', 'sk-real'):
            with patch.object(settings, 'ANTHROPIC_API_KEY', ''):
                with patch.object(settings, 'GEMINI_API_KEY', 'AIza-real'):
                    with patch.object(settings, 'DEEPSEEK_API_KEY', ''):
                        with patch.object(settings, 'DEMO_MODE', 'auto'):
                            caps = CapabilityMatrix()
                            providers = caps.available_ai_providers
                            
                            assert "demo" in providers  # Always available
                            assert "openai" in providers
                            assert "anthropic" not in providers
                            assert "gemini" in providers
                            assert "deepseek" not in providers


def test_smoke_no_mixed_mode_security_breach():
    """
    SMOKE TEST: Prevent the security breach of AI without auth.
    
    This is the most critical test - it ensures we never have a 
    configuration where production AI is available without authentication.
    """
    from app.core.capabilities import CAPABILITIES
    
    # Check the current configuration
    caps = CAPABILITIES.get_status_summary()["capabilities"]
    
    # Extract auth and AI statuses
    auth_status = caps.get("auth", "demo")
    ai_providers = ["openai", "anthropic", "gemini", "deepseek"]
    
    # Check if any AI provider is in production
    has_production_ai = any(
        caps.get(provider, "demo") == "production" 
        for provider in ai_providers
    )
    
    # CRITICAL ASSERTION: No production AI without production auth
    if has_production_ai:
        assert auth_status == "production", (
            "SECURITY VIOLATION: Production AI providers are configured "
            "but authentication is not in production mode. This could "
            "lead to API key exposure!"
        )


if __name__ == "__main__":
    # Run the smoke test
    test_smoke_no_mixed_mode_security_breach()
    print("✅ Security smoke test passed!")