# Backend Patterns

This guide covers Python/FastAPI patterns and best practices used throughout the backend codebase.

## Service Layer Pattern

### Structure
```
services/
├── llm/
│   ├── __init__.py
│   ├── base.py         # Abstract base class
│   ├── openai.py       # Concrete implementation
│   ├── anthropic.py    # Concrete implementation
│   └── demo.py         # Demo implementation
```

### Abstract Base Class
```python
# services/llm/base.py
from abc import ABC, abstractmethod
from typing import Optional
from app.models.llm import LLMResponse, LLMRequest

class LLMService(ABC):
    """Abstract base class for LLM services."""
    
    @abstractmethod
    async def generate_text(
        self,
        request: LLMRequest,
        user_id: Optional[str] = None
    ) -> LLMResponse:
        """Generate text based on prompt."""
        pass
    
    @abstractmethod
    async def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if service is available."""
        pass
```

### Concrete Implementation
```python
# services/llm/openai.py
from openai import AsyncOpenAI
from app.services.llm.base import LLMService

class OpenAIService(LLMService):
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)
        
    async def generate_text(
        self,
        request: LLMRequest,
        user_id: Optional[str] = None
    ) -> LLMResponse:
        try:
            # Rate limiting
            await self.check_rate_limit(user_id)
            
            # Make API call
            response = await self.client.chat.completions.create(
                model=request.model,
                messages=[{"role": "user", "content": request.prompt}],
                max_tokens=request.max_tokens,
                temperature=request.temperature,
            )
            
            # Track usage
            await self.track_usage(user_id, response.usage)
            
            return LLMResponse(
                text=response.choices[0].message.content,
                tokens_used=response.usage.total_tokens,
                model=request.model,
            )
            
        except RateLimitError:
            raise AppException("Rate limit exceeded", ErrorCode.RATE_LIMITED)
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            raise AppException("Generation failed", ErrorCode.EXTERNAL_SERVICE_ERROR)
```

### Factory Pattern
```python
# services/llm/factory.py
from typing import Dict, Type
from app.services.llm.base import LLMService
from app.services.llm.openai import OpenAIService
from app.services.llm.anthropic import AnthropicService

class LLMServiceFactory:
    _services: Dict[str, Type[LLMService]] = {
        "openai": OpenAIService,
        "anthropic": AnthropicService,
        "gemini": GeminiService,
    }
    
    @classmethod
    def create(cls, provider: str, **kwargs) -> LLMService:
        """Create LLM service instance."""
        service_class = cls._services.get(provider)
        if not service_class:
            raise ValueError(f"Unknown provider: {provider}")
        
        return service_class(**kwargs)
    
    @classmethod
    def register(cls, name: str, service_class: Type[LLMService]):
        """Register new service type."""
        cls._services[name] = service_class
```

## Repository Pattern

### Base Repository
```python
# repositories/base.py
from typing import Generic, TypeVar, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

T = TypeVar("T")

class BaseRepository(Generic[T]):
    """Base repository with common CRUD operations."""
    
    def __init__(self, model: Type[T], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get(self, id: str) -> Optional[T]:
        """Get by ID."""
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_many(
        self,
        skip: int = 0,
        limit: int = 100,
        **filters
    ) -> List[T]:
        """Get multiple with pagination."""
        query = select(self.model)
        
        for key, value in filters.items():
            query = query.where(getattr(self.model, key) == value)
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create(self, **data) -> T:
        """Create new record."""
        instance = self.model(**data)
        self.db.add(instance)
        await self.db.commit()
        await self.db.refresh(instance)
        return instance
    
    async def update(self, id: str, **data) -> Optional[T]:
        """Update existing record."""
        await self.db.execute(
            update(self.model)
            .where(self.model.id == id)
            .values(**data)
        )
        await self.db.commit()
        return await self.get(id)
    
    async def delete(self, id: str) -> bool:
        """Delete record."""
        result = await self.db.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.db.commit()
        return result.rowcount > 0
```

### Specific Repository
```python
# repositories/user.py
from app.repositories.base import BaseRepository
from app.models.user import User

class UserRepository(BaseRepository[User]):
    """User-specific repository methods."""
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_admins(self) -> List[User]:
        """Get all admin users."""
        result = await self.db.execute(
            select(User).where(User.role.in_(["admin", "super_admin"]))
        )
        return result.scalars().all()
    
    async def search(self, query: str) -> List[User]:
        """Search users by name or email."""
        result = await self.db.execute(
            select(User).where(
                User.email.ilike(f"%{query}%") |
                User.full_name.ilike(f"%{query}%")
            )
        )
        return result.scalars().all()
```

## Dependency Injection

### Database Session
```python
# core/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### Service Dependencies
```python
# dependencies.py
from fastapi import Depends
from app.repositories.user import UserRepository
from app.services.llm import LLMService

async def get_user_repository(
    db: AsyncSession = Depends(get_db)
) -> UserRepository:
    """Provide user repository."""
    return UserRepository(User, db)

def get_llm_service(
    user: AuthUser = Depends(get_current_user)
) -> LLMService:
    """Provide LLM service based on user preferences."""
    if user.preferred_provider:
        return LLMServiceFactory.create(user.preferred_provider)
    return LLMServiceFactory.create(settings.DEFAULT_LLM_PROVIDER)
```

### Using Dependencies
```python
# api/endpoints/users.py
@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    repo: UserRepository = Depends(get_user_repository),
    current_user: AuthUser = Depends(get_current_user)
):
    user = await repo.get(user_id)
    if not user:
        raise NotFoundError("User")
    
    # Check permissions
    if user.id != current_user.id and not current_user.is_admin:
        raise AuthorizationError()
    
    return user
```

## Background Tasks

### Using BackgroundTasks
```python
from fastapi import BackgroundTasks

@router.post("/send-notification")
async def send_notification(
    user_id: str,
    message: str,
    background_tasks: BackgroundTasks,
    current_user: AuthUser = Depends(require_admin)
):
    # Quick response
    background_tasks.add_task(
        send_email_notification,
        user_id,
        message,
        sender_id=current_user.id
    )
    
    return {"status": "Notification queued"}

async def send_email_notification(
    user_id: str,
    message: str,
    sender_id: str
):
    """Background task to send email."""
    user = await get_user(user_id)
    await email_service.send(
        to=user.email,
        subject="New Notification",
        body=message
    )
    
    # Log the action
    await create_audit_log(
        action="notification_sent",
        user_id=user_id,
        actor_id=sender_id
    )
```

### Celery for Heavy Tasks
```python
# tasks/celery_app.py
from celery import Celery

celery_app = Celery(
    "prompt_stack",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# tasks/embeddings.py
from app.tasks.celery_app import celery_app

@celery_app.task(bind=True, max_retries=3)
def generate_embeddings(self, document_id: str):
    """Generate embeddings for document."""
    try:
        document = get_document(document_id)
        chunks = chunk_document(document)
        
        for i, chunk in enumerate(chunks):
            embedding = generate_embedding(chunk)
            save_embedding(document_id, i, embedding)
            
            # Update progress
            self.update_state(
                state="PROGRESS",
                meta={"current": i, "total": len(chunks)}
            )
        
        return {"status": "completed", "chunks": len(chunks)}
        
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
```

## Caching Patterns

### Redis Caching
```python
# core/cache.py
import redis.asyncio as redis
import json
from typing import Optional, Any

class Cache:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set(
        self,
        key: str,
        value: Any,
        expire: int = 3600
    ):
        """Set value in cache with expiration."""
        await self.redis.setex(
            key,
            expire,
            json.dumps(value)
        )
    
    async def delete(self, key: str):
        """Delete from cache."""
        await self.redis.delete(key)
    
    async def invalidate_pattern(self, pattern: str):
        """Delete all keys matching pattern."""
        cursor = 0
        while True:
            cursor, keys = await self.redis.scan(
                cursor,
                match=pattern,
                count=100
            )
            if keys:
                await self.redis.delete(*keys)
            if cursor == 0:
                break

cache = Cache(settings.REDIS_URL)
```

### Cache Decorator
```python
from functools import wraps
import hashlib

def cached(expire: int = 3600):
    """Cache decorator for async functions."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            key = f"{func.__module__}.{func.__name__}:"
            key += hashlib.md5(
                f"{args}{kwargs}".encode()
            ).hexdigest()
            
            # Try cache
            result = await cache.get(key)
            if result is not None:
                return result
            
            # Call function
            result = await func(*args, **kwargs)
            
            # Cache result
            await cache.set(key, result, expire)
            
            return result
        return wrapper
    return decorator

# Usage
@cached(expire=300)  # 5 minutes
async def get_user_stats(user_id: str):
    """Get user statistics with caching."""
    return await calculate_user_stats(user_id)
```

## Configuration Management

### Settings with Pydantic
```python
# core/config.py
from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Prompt Stack"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # External Services
    OPENAI_API_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

settings = get_settings()
```

### Feature Flags
```python
# core/features.py
from typing import Dict, Any
from app.core.config import settings

class FeatureFlags:
    def __init__(self):
        self._flags = {
            "new_dashboard": self._check_new_dashboard,
            "ai_chat": self._check_ai_chat,
            "advanced_analytics": self._check_advanced_analytics,
        }
    
    def is_enabled(self, feature: str, user: Optional[AuthUser] = None) -> bool:
        """Check if feature is enabled."""
        checker = self._flags.get(feature)
        if not checker:
            return False
        
        return checker(user)
    
    def _check_new_dashboard(self, user: Optional[AuthUser]) -> bool:
        """New dashboard for beta users."""
        if settings.is_development:
            return True
        
        if user and user.is_beta_tester:
            return True
        
        return False
    
    def _check_ai_chat(self, user: Optional[AuthUser]) -> bool:
        """AI chat for authenticated users."""
        return user is not None
    
    def _check_advanced_analytics(self, user: Optional[AuthUser]) -> bool:
        """Advanced analytics for premium users."""
        if user and user.subscription_tier == "premium":
            return True
        
        return False

features = FeatureFlags()
```

## Testing Patterns

### Fixtures
```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.fixture
async def client(app):
    """Create test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_client(client, test_user):
    """Client with authentication."""
    token = create_test_token(test_user)
    client.headers["Authorization"] = f"Bearer {token}"
    return client

@pytest.fixture
async def test_user(db: AsyncSession):
    """Create test user."""
    user = User(
        email="test@example.com",
        hashed_password=hash_password("testpass"),
        role="user"
    )
    db.add(user)
    await db.commit()
    return user
```

### Mocking External Services
```python
# tests/mocks/llm.py
from unittest.mock import AsyncMock

class MockLLMService:
    def __init__(self):
        self.generate_text = AsyncMock(
            return_value=LLMResponse(
                text="Mocked response",
                tokens_used=10,
                model="mock"
            )
        )
        
        self.count_tokens = AsyncMock(return_value=5)
        self.is_available = AsyncMock(return_value=True)

# Usage in tests
@pytest.fixture
def mock_llm_service(monkeypatch):
    """Mock LLM service."""
    mock_service = MockLLMService()
    monkeypatch.setattr(
        "app.services.llm.get_llm_service",
        lambda: mock_service
    )
    return mock_service
```

## Performance Patterns

### Database Query Optimization
```python
# Eager loading relationships
from sqlalchemy.orm import selectinload

async def get_user_with_profile(user_id: str):
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == user_id)
    )
    return result.scalar_one_or_none()

# Bulk operations
async def bulk_create_users(users_data: List[dict]):
    await db.execute(
        insert(User),
        users_data
    )
    await db.commit()
```

### Async Context Managers
```python
class DatabaseTransaction:
    """Async context manager for transactions."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def __aenter__(self):
        await self.db.begin()
        return self.db
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.db.rollback()
        else:
            await self.db.commit()
        await self.db.close()

# Usage
async with DatabaseTransaction(db) as session:
    user = await create_user(session, user_data)
    await create_profile(session, user.id, profile_data)
    # Automatically commits or rolls back
```