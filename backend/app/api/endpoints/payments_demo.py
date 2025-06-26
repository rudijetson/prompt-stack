"""Demo payment endpoints that work without configuration."""
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Dict, List, Optional
import json
import hmac
import hashlib
from app.core.config import settings

router = APIRouter(tags=["payments-demo"])

@router.get("/stripe/status")
async def stripe_status() -> Dict:
    """Check Stripe configuration status."""
    configured = bool(settings.STRIPE_SECRET_KEY)
    test_mode = settings.STRIPE_SECRET_KEY.startswith("sk_test_") if configured else None
    
    return {
        "configured": configured,
        "message": "Stripe is configured in LIVE mode!" if configured and not test_mode else 
                  "Stripe is configured in TEST mode" if configured else
                  "Add STRIPE_SECRET_KEY to .env to enable",
        "test_mode": test_mode,
        "webhook_configured": bool(settings.STRIPE_WEBHOOK_SECRET),
        "features": [
            "Checkout sessions",
            "Subscriptions", 
            "Customer portal",
            "Webhooks",
            "Member discounts"
        ]
    }

@router.get("/lemonsqueezy/status")
async def lemonsqueezy_status() -> Dict:
    """Check Lemon Squeezy configuration status."""
    configured = bool(settings.LEMONSQUEEZY_API_KEY)
    
    return {
        "configured": configured,
        "message": "Lemon Squeezy is configured!" if configured else "Add LEMONSQUEEZY_API_KEY to .env to enable",
        "store_id": settings.LEMONSQUEEZY_STORE_ID if configured else None,
        "webhook_configured": bool(settings.LEMONSQUEEZY_WEBHOOK_SECRET),
        "member_discount_code": settings.LEMONSQUEEZY_MEMBER_DISCOUNT_CODE if configured else None,
        "features": [
            "Digital products",
            "Automatic tax handling",
            "File delivery",
            "License keys",
            "Global payments"
        ]
    }

@router.get("/comparison")
async def payment_comparison() -> Dict:
    """Compare Stripe vs Lemon Squeezy for different use cases."""
    return {
        "stripe": {
            "name": "Stripe",
            "best_for": "Full control, complex flows, lower fees",
            "transaction_fee": "2.9% + $0.30",
            "setup_time": "2-4 hours",
            "tax_handling": "You manage",
            "file_delivery": "You build",
            "when_to_use": [
                "Need full control over payment flow",
                "Complex subscription logic",
                "Multiple payment methods required",
                "Can handle tax compliance",
                "Want lowest fees"
            ]
        },
        "lemonsqueezy": {
            "name": "Lemon Squeezy",
            "best_for": "Quick setup, digital products, zero tax hassle",
            "transaction_fee": "5% + $0.50",
            "setup_time": "15 minutes",
            "tax_handling": "Automatic globally",
            "file_delivery": "Built-in",
            "when_to_use": [
                "Selling digital products",
                "Want zero tax complexity",
                "Need quick setup",
                "Global sales from day one",
                "Value simplicity over fees"
            ]
        }
    }

@router.get("/recommendations")
async def payment_recommendations() -> Dict:
    """Get payment provider recommendations based on use case."""
    return {
        "scenarios": [
            {
                "scenario": "SaaS with subscriptions",
                "recommendation": "stripe",
                "reason": "Better subscription management and lower fees"
            },
            {
                "scenario": "Digital downloads/courses",
                "recommendation": "lemonsqueezy",
                "reason": "Automatic file delivery and tax handling"
            },
            {
                "scenario": "Marketplace with vendors",
                "recommendation": "stripe",
                "reason": "Stripe Connect for multi-party payments"
            },
            {
                "scenario": "Info products globally",
                "recommendation": "lemonsqueezy",
                "reason": "Zero tax complexity for international sales"
            },
            {
                "scenario": "MVP/Quick launch",
                "recommendation": "lemonsqueezy",
                "reason": "15-minute setup vs hours with Stripe"
            }
        ]
    }

@router.post("/test-checkout")
async def test_checkout() -> Dict:
    """Simulate a checkout response for testing."""
    return {
        "message": "This is a demo endpoint",
        "stripe_example": {
            "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_demo",
            "session_id": "cs_test_demo_123"
        },
        "lemonsqueezy_example": {
            "checkout_url": "https://demo.lemonsqueezy.com/checkout/buy/variant-id",
            "checkout_id": "demo_checkout_456"
        }
    }

@router.post("/lemonsqueezy/webhook")
async def lemonsqueezy_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None, alias="X-Signature")
):
    """Handle Lemon Squeezy webhook events."""
    if not settings.LEMONSQUEEZY_WEBHOOK_SECRET:
        return {"error": "Webhook secret not configured"}
    
    # Get raw body
    body = await request.body()
    
    # Verify signature if provided
    if x_signature and settings.LEMONSQUEEZY_WEBHOOK_SECRET:
        expected_signature = hmac.new(
            settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_signature, x_signature):
            raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse webhook data
    try:
        data = json.loads(body)
        event_name = data.get("meta", {}).get("event_name")
        
        # Log the event (in production, process it)
        print(f"Lemon Squeezy webhook received: {event_name}")
        
        # Handle different events
        if event_name == "order_created":
            order = data.get("data", {})
            print(f"New order: {order.get('attributes', {}).get('identifier')}")
            # In production: deliver product, send email, etc.
            
        elif event_name == "license_key_created":
            license_key = data.get("data", {})
            print(f"License key created: {license_key.get('attributes', {}).get('key')}")
            # In production: store license key, email customer
            
        return {
            "status": "success",
            "event": event_name,
            "message": f"Webhook {event_name} processed"
        }
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature")
):
    """Handle Stripe webhook events."""
    if not settings.STRIPE_WEBHOOK_SECRET:
        return {"error": "Webhook secret not configured"}
    
    # Get raw body
    body = await request.body()
    
    # In production, verify Stripe signature here
    # For demo, just parse and log
    try:
        data = json.loads(body)
        event_type = data.get("type")
        
        print(f"Stripe webhook received: {event_type}")
        
        if event_type == "checkout.session.completed":
            session = data.get("data", {}).get("object", {})
            print(f"Checkout completed: {session.get('id')}")
            # In production: fulfill order, update database
            
        return {
            "status": "success",
            "event": event_type,
            "message": f"Webhook {event_type} processed"
        }
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}