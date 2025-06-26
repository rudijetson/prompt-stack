"""Payment-related Pydantic models."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CreateCheckoutSession(BaseModel):
    """Request model for creating a checkout session."""
    configuration_id: str = Field(..., description="ID of the configuration to purchase")
    configuration_name: str = Field(..., description="Name of the configuration")
    price: int = Field(..., gt=0, description="Price in cents")
    success_url: str = Field(..., description="URL to redirect after successful payment")
    cancel_url: str = Field(..., description="URL to redirect if payment is cancelled")


class CheckoutSessionResponse(BaseModel):
    """Response model for checkout session creation."""
    checkout_url: str = Field(..., description="Stripe checkout URL")
    session_id: str = Field(..., description="Stripe session ID")


class PurchaseRecord(BaseModel):
    """Model for a configuration purchase record."""
    id: int
    user_id: str
    configuration_id: str
    configuration_name: str
    amount: int
    discount_applied: bool = False
    status: str = "pending"
    created_at: datetime
    download_token: Optional[str] = None


class VerifyMembershipRequest(BaseModel):
    """Request model for verifying Substack membership."""
    substack_email: str = Field(..., description="Email used for Substack subscription")


class VerifyMembershipResponse(BaseModel):
    """Response model for membership verification."""
    verified: bool
    message: str
    discount_percentage: Optional[int] = None