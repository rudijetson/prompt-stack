"""Lemon Squeezy payment models."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class CreateLSCheckout(BaseModel):
    """Request model for creating Lemon Squeezy checkout."""
    variant_id: str = Field(..., description="Lemon Squeezy variant ID")
    discount_code: Optional[str] = Field(None, description="Discount code to apply")
    custom_data: Optional[Dict[str, Any]] = Field(None, description="Custom metadata")


class LSCheckoutResponse(BaseModel):
    """Response model for Lemon Squeezy checkout creation."""
    checkout_url: str = Field(..., description="URL to redirect user to")
    checkout_id: str = Field(..., description="Lemon Squeezy checkout ID")


class LSProduct(BaseModel):
    """Lemon Squeezy product model."""
    id: str
    name: str
    slug: str
    description: Optional[str]
    price: int  # in cents
    price_formatted: str
    buy_now_url: str
    status: str


class LSVariant(BaseModel):
    """Lemon Squeezy variant (pricing option) model."""
    id: str
    product_id: str
    name: str
    slug: str
    price: int  # in cents
    price_formatted: str
    interval: Optional[str]  # month, year, etc
    interval_count: Optional[int]
    is_subscription: bool
    status: str


class LSPurchase(BaseModel):
    """Lemon Squeezy purchase record."""
    id: int
    user_id: str
    variant_id: str
    order_id: Optional[str]
    order_number: Optional[str]
    license_key: Optional[str]
    total: Optional[int]
    tax: Optional[int]
    discount: Optional[int]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]


class LSWebhookEvent(BaseModel):
    """Lemon Squeezy webhook event."""
    event_name: str = Field(..., alias="meta.event_name")
    data: Dict[str, Any]
    
    class Config:
        populate_by_name = True