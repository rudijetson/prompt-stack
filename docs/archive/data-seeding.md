# Data Seeding & Fixtures

This guide covers patterns for seeding data, creating fixtures, and managing test data in development and testing environments.

## Overview

Data seeding is essential for:
- Setting up development environments with realistic data
- Creating consistent test scenarios
- Demonstrating features with example data
- Performance testing with large datasets
- Initial production setup (roles, categories, etc.)

## Seed Script Structure

### Main Seeder

```python
# scripts/seed_data.py
import asyncio
import click
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.seeders import (
    seed_users,
    seed_products,
    seed_orders,
    seed_admin_data,
    clear_all_data
)

@click.command()
@click.option('--env', default='development', help='Environment to seed')
@click.option('--clear', is_flag=True, help='Clear existing data first')
@click.option('--only', multiple=True, help='Only seed specific types')
@click.option('--count', default=100, help='Number of records to create')
async def seed_database(env: str, clear: bool, only: list, count: int):
    """Seed database with test data."""
    async with get_db_session() as db:
        try:
            if clear:
                click.echo("Clearing existing data...")
                await clear_all_data(db)
            
            # Determine what to seed
            seeders = {
                'users': seed_users,
                'products': seed_products,
                'orders': seed_orders,
                'admin': seed_admin_data,
            }
            
            to_seed = only if only else seeders.keys()
            
            # Run seeders
            for seeder_name in to_seed:
                if seeder_name in seeders:
                    click.echo(f"Seeding {seeder_name}...")
                    await seeders[seeder_name](db, env, count)
                    
            await db.commit()
            click.echo("✅ Database seeded successfully!")
            
        except Exception as e:
            await db.rollback()
            click.echo(f"❌ Error seeding database: {e}", err=True)
            raise

if __name__ == "__main__":
    asyncio.run(seed_database())
```

## Seeder Modules

### User Seeder

```python
# app/seeders/users.py
from faker import Faker
from app.models.user import User
from app.core.auth import hash_password
import random

fake = Faker()

async def seed_users(db: AsyncSession, env: str, count: int):
    """Seed users with realistic data."""
    users = []
    
    # Always create test users
    test_users = [
        {
            "email": "admin@example.com",
            "password": "admin123",
            "full_name": "Admin User",
            "role": "admin",
            "is_active": True,
        },
        {
            "email": "user@example.com",
            "password": "user123",
            "full_name": "Test User",
            "role": "user",
            "is_active": True,
        },
    ]
    
    for user_data in test_users:
        user = User(
            email=user_data["email"],
            hashed_password=hash_password(user_data["password"]),
            full_name=user_data["full_name"],
            role=user_data["role"],
            is_active=user_data["is_active"],
        )
        db.add(user)
        users.append(user)
    
    # Generate random users
    for i in range(count - len(test_users)):
        user = User(
            email=fake.unique.email(),
            hashed_password=hash_password("password123"),
            full_name=fake.name(),
            role=random.choice(["user", "user", "user", "premium"]),  # 75% regular users
            is_active=random.choice([True, True, True, False]),  # 75% active
            created_at=fake.date_time_between(start_date="-1y", end_date="now"),
            phone=fake.phone_number() if random.random() > 0.5 else None,
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={i}",
            bio=fake.text(max_nb_chars=200) if random.random() > 0.7 else None,
        )
        db.add(user)
        users.append(user)
    
    await db.flush()  # Get IDs without committing
    
    # Create user preferences
    for user in users:
        pref = UserPreferences(
            user_id=user.id,
            theme=random.choice(["light", "dark", "system"]),
            language=random.choice(["en", "es", "fr", "de"]),
            notifications_enabled=random.choice([True, False]),
            email_frequency=random.choice(["daily", "weekly", "never"]),
        )
        db.add(pref)
    
    return users
```

### Product Seeder

```python
# app/seeders/products.py
from decimal import Decimal
import random
from app.models.product import Product, Category

async def seed_products(db: AsyncSession, env: str, count: int):
    """Seed products with categories."""
    
    # Create categories first
    categories = [
        "Electronics", "Books", "Clothing", "Home & Garden",
        "Sports", "Toys", "Health", "Automotive"
    ]
    
    category_objects = []
    for cat_name in categories:
        category = Category(
            name=cat_name,
            slug=cat_name.lower().replace(" & ", "-").replace(" ", "-"),
            description=fake.sentence(),
        )
        db.add(category)
        category_objects.append(category)
    
    await db.flush()
    
    # Product templates for realistic data
    product_templates = {
        "Electronics": [
            ("Laptop", 800, 2000),
            ("Smartphone", 300, 1200),
            ("Headphones", 50, 300),
            ("Tablet", 200, 800),
        ],
        "Books": [
            ("Novel", 10, 30),
            ("Textbook", 50, 200),
            ("Comic Book", 5, 20),
            ("Magazine", 3, 10),
        ],
        # ... more templates
    }
    
    products = []
    for _ in range(count):
        category = random.choice(category_objects)
        
        # Get appropriate product type for category
        if category.name in product_templates:
            product_type, min_price, max_price = random.choice(
                product_templates[category.name]
            )
            name = f"{fake.company()} {product_type}"
        else:
            name = fake.catch_phrase()
            min_price, max_price = 10, 1000
        
        product = Product(
            name=name,
            slug=name.lower().replace(" ", "-") + f"-{fake.uuid4()[:8]}",
            description=fake.text(max_nb_chars=500),
            price=Decimal(str(round(random.uniform(min_price, max_price), 2))),
            category_id=category.id,
            sku=fake.ean13(),
            stock_quantity=random.randint(0, 1000),
            is_active=random.choice([True, True, True, False]),  # 75% active
            featured=random.random() > 0.9,  # 10% featured
            created_at=fake.date_time_between(start_date="-6m", end_date="now"),
            tags=[fake.word() for _ in range(random.randint(0, 5))],
            metadata={
                "brand": fake.company(),
                "weight": f"{random.randint(100, 5000)}g",
                "dimensions": f"{random.randint(10, 100)}x{random.randint(10, 100)}x{random.randint(10, 100)}mm",
            },
        )
        db.add(product)
        products.append(product)
    
    return products
```

### Order Seeder

```python
# app/seeders/orders.py
from datetime import datetime, timedelta
from app.models.order import Order, OrderItem

async def seed_orders(db: AsyncSession, env: str, count: int):
    """Seed orders with realistic patterns."""
    
    # Get existing users and products
    users = await db.execute(select(User))
    users = users.scalars().all()
    
    products = await db.execute(select(Product).where(Product.is_active == True))
    products = products.scalars().all()
    
    if not users or not products:
        raise ValueError("Need users and products before seeding orders")
    
    orders = []
    
    for _ in range(count):
        # Simulate realistic order patterns
        order_date = fake.date_time_between(start_date="-3m", end_date="now")
        user = random.choice(users)
        
        # Order status progression
        if order_date < datetime.now() - timedelta(days=30):
            status = random.choice(["completed", "completed", "cancelled"])
        elif order_date < datetime.now() - timedelta(days=7):
            status = random.choice(["shipped", "delivered", "completed"])
        else:
            status = random.choice(["pending", "processing", "shipped"])
        
        order = Order(
            user_id=user.id,
            order_number=f"ORD-{fake.uuid4()[:8].upper()}",
            status=status,
            subtotal=Decimal("0"),
            tax=Decimal("0"),
            shipping=Decimal(str(random.choice([0, 5.99, 9.99, 19.99]))),
            total=Decimal("0"),
            currency="USD",
            created_at=order_date,
            updated_at=order_date + timedelta(hours=random.randint(0, 48)),
            shipping_address={
                "name": user.full_name,
                "street": fake.street_address(),
                "city": fake.city(),
                "state": fake.state_abbr(),
                "postal_code": fake.postcode(),
                "country": "US",
            },
            notes=fake.sentence() if random.random() > 0.8 else None,
        )
        
        # Add order items
        num_items = random.randint(1, 5)
        order_products = random.sample(products, min(num_items, len(products)))
        
        subtotal = Decimal("0")
        for product in order_products:
            quantity = random.randint(1, 3)
            price = product.price
            
            item = OrderItem(
                order=order,
                product_id=product.id,
                quantity=quantity,
                price=price,
                total=price * quantity,
                product_snapshot={
                    "name": product.name,
                    "sku": product.sku,
                    "category": product.category.name,
                },
            )
            db.add(item)
            subtotal += item.total
        
        # Calculate totals
        order.subtotal = subtotal
        order.tax = subtotal * Decimal("0.08")  # 8% tax
        order.total = order.subtotal + order.tax + order.shipping
        
        db.add(order)
        orders.append(order)
    
    return orders
```

## Factory Pattern with Factory Boy

```python
# tests/factories.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from faker import Faker
from app.models import User, Product, Order

fake = Faker()

class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session_persistence = "commit"
    
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    full_name = factory.Faker("name")
    hashed_password = factory.LazyFunction(lambda: hash_password("password123"))
    role = "user"
    is_active = True
    created_at = factory.Faker("date_time_between", start_date="-1y", end_date="now")
    
    @factory.post_generation
    def preferences(self, create, extracted, **kwargs):
        if not create:
            return
        
        UserPreferencesFactory(user=self)
    
    @factory.post_generation
    def orders(self, create, extracted, **kwargs):
        if not create:
            return
        
        if extracted:
            for order in extracted:
                self.orders.append(order)

class AdminFactory(UserFactory):
    """Factory for admin users."""
    role = "admin"
    email = factory.Sequence(lambda n: f"admin{n}@example.com")

class ProductFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Product
    
    name = factory.Faker("catch_phrase")
    slug = factory.LazyAttribute(lambda obj: obj.name.lower().replace(" ", "-"))
    description = factory.Faker("text", max_nb_chars=500)
    price = factory.Faker("pydecimal", left_digits=3, right_digits=2, positive=True)
    stock_quantity = factory.Faker("random_int", min=0, max=1000)
    category = factory.SubFactory(CategoryFactory)
    
    class Params:
        # Trait for out of stock products
        out_of_stock = factory.Trait(
            stock_quantity=0,
            is_active=False
        )
        
        # Trait for featured products
        featured = factory.Trait(
            featured=True,
            price=factory.Faker("pydecimal", left_digits=4, right_digits=2, positive=True)
        )

# Usage in tests
def test_user_creation():
    # Create single user
    user = UserFactory()
    
    # Create admin
    admin = AdminFactory()
    
    # Create user with specific attributes
    premium_user = UserFactory(
        role="premium",
        email="premium@example.com"
    )
    
    # Create batch
    users = UserFactory.create_batch(10)
    
    # Create with related objects
    user_with_orders = UserFactory(
        orders=[OrderFactory() for _ in range(3)]
    )
```

## Fixture Management

### Pytest Fixtures

```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from tests.factories import UserFactory, ProductFactory

@pytest.fixture
async def db_session():
    """Provide clean database session for tests."""
    async with get_db_session() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def test_user(db_session: AsyncSession):
    """Create test user."""
    user = UserFactory()
    db_session.add(user)
    await db_session.commit()
    return user

@pytest.fixture
async def admin_user(db_session: AsyncSession):
    """Create admin user."""
    admin = AdminFactory()
    db_session.add(admin)
    await db_session.commit()
    return admin

@pytest.fixture
async def products(db_session: AsyncSession):
    """Create test products."""
    products = ProductFactory.create_batch(5)
    db_session.add_all(products)
    await db_session.commit()
    return products

@pytest.fixture
async def sample_data(db_session: AsyncSession):
    """Create comprehensive test data."""
    # Users
    users = UserFactory.create_batch(3)
    admin = AdminFactory()
    
    # Products
    products = ProductFactory.create_batch(10)
    featured = ProductFactory(featured=True)
    out_of_stock = ProductFactory(out_of_stock=True)
    
    # Add all to session
    db_session.add_all([*users, admin, *products, featured, out_of_stock])
    await db_session.commit()
    
    return {
        "users": users,
        "admin": admin,
        "products": products,
        "featured_product": featured,
        "out_of_stock_product": out_of_stock,
    }
```

## Environment-Specific Seeds

### Development Seeds

```python
# app/seeders/environments/development.py
async def seed_development(db: AsyncSession):
    """Seed development environment with rich data."""
    
    # Create diverse users
    users = await create_users(db, {
        "admins": 2,
        "premium_users": 10,
        "regular_users": 50,
        "inactive_users": 5,
    })
    
    # Create product catalog
    products = await create_products(db, {
        "categories": 8,
        "products_per_category": 20,
        "featured_products": 10,
    })
    
    # Create realistic order history
    orders = await create_orders(db, {
        "orders_per_user": (1, 10),  # Random range
        "date_range": "-6m",
        "include_cancelled": True,
        "include_refunds": True,
    })
    
    # Create sample content
    await create_blog_posts(db, 30)
    await create_support_tickets(db, 20)
    
    print(f"✅ Development seed complete:")
    print(f"   - {len(users)} users")
    print(f"   - {len(products)} products")
    print(f"   - {len(orders)} orders")
```

### Test Seeds

```python
# app/seeders/environments/test.py
async def seed_test(db: AsyncSession):
    """Seed minimal test data."""
    
    # Fixed test users
    users = {
        "admin": await create_user(db, "admin@test.com", "admin", role="admin"),
        "user": await create_user(db, "user@test.com", "user"),
        "premium": await create_user(db, "premium@test.com", "premium", role="premium"),
        "inactive": await create_user(db, "inactive@test.com", "inactive", is_active=False),
    }
    
    # Fixed test products
    products = {
        "laptop": await create_product(db, "Test Laptop", 999.99, stock=10),
        "book": await create_product(db, "Test Book", 29.99, stock=100),
        "out_of_stock": await create_product(db, "Out of Stock", 99.99, stock=0),
    }
    
    # Known test scenarios
    await create_order(db, users["user"], [products["laptop"]], status="completed")
    await create_order(db, users["premium"], [products["book"]], status="pending")
    
    return {"users": users, "products": products}
```

### Production Seeds

```python
# app/seeders/environments/production.py
async def seed_production(db: AsyncSession):
    """Seed production with essential data only."""
    
    # System roles
    roles = ["user", "premium", "admin", "super_admin"]
    for role_name in roles:
        role = Role(name=role_name, description=f"{role_name.title()} role")
        db.add(role)
    
    # Default categories
    categories = [
        ("electronics", "Electronics", "Electronic devices and accessories"),
        ("books", "Books", "Physical and digital books"),
        ("clothing", "Clothing", "Apparel and fashion"),
        # ...
    ]
    
    for slug, name, desc in categories:
        category = Category(slug=slug, name=name, description=desc)
        db.add(category)
    
    # System configuration
    configs = [
        ("site_name", "Prompt-Stack"),
        ("support_email", "support@example.com"),
        ("maintenance_mode", "false"),
    ]
    
    for key, value in configs:
        config = SystemConfig(key=key, value=value)
        db.add(config)
    
    await db.commit()
    print("✅ Production seed complete")
```

## Large Dataset Generation

### Batch Processing

```python
# scripts/generate_large_dataset.py
async def generate_large_dataset(total_records: int, batch_size: int = 1000):
    """Generate large datasets efficiently."""
    
    async with get_db_session() as db:
        processed = 0
        
        with click.progressbar(length=total_records) as bar:
            while processed < total_records:
                batch_count = min(batch_size, total_records - processed)
                
                # Generate batch
                users = [
                    User(
                        email=f"user{processed + i}@example.com",
                        hashed_password=hash_password("password"),
                        full_name=fake.name(),
                    )
                    for i in range(batch_count)
                ]
                
                # Bulk insert
                db.add_all(users)
                await db.commit()
                
                processed += batch_count
                bar.update(batch_count)
        
        print(f"✅ Generated {processed} records")
```

### CSV Import

```python
# app/seeders/csv_importer.py
import csv
from pathlib import Path

async def import_from_csv(db: AsyncSession, model_class, csv_path: Path, mapping: dict):
    """Import data from CSV file."""
    
    with open(csv_path, "r") as file:
        reader = csv.DictReader(file)
        
        batch = []
        for row in reader:
            # Map CSV columns to model fields
            data = {}
            for csv_field, model_field in mapping.items():
                if csv_field in row:
                    # Handle type conversions
                    value = row[csv_field]
                    if model_field.endswith("_at"):
                        value = datetime.fromisoformat(value)
                    elif model_field in ["price", "total"]:
                        value = Decimal(value)
                    elif model_field in ["is_active", "featured"]:
                        value = value.lower() == "true"
                    
                    data[model_field] = value
            
            instance = model_class(**data)
            batch.append(instance)
            
            # Bulk insert every 1000 records
            if len(batch) >= 1000:
                db.add_all(batch)
                await db.commit()
                batch = []
        
        # Insert remaining
        if batch:
            db.add_all(batch)
            await db.commit()

# Usage
await import_from_csv(
    db,
    Product,
    Path("data/products.csv"),
    mapping={
        "product_name": "name",
        "description": "description",
        "retail_price": "price",
        "quantity": "stock_quantity",
        "active": "is_active",
    }
)
```

## Seed Management Commands

### Makefile Commands

```makefile
# Makefile
.PHONY: seed seed-dev seed-test seed-prod

# Seed development data
seed-dev:
	docker-compose exec backend python scripts/seed_data.py --env development --clear

# Seed test data
seed-test:
	docker-compose exec backend python scripts/seed_data.py --env test --clear --count 10

# Seed production essentials
seed-prod:
	docker-compose exec backend python scripts/seed_data.py --env production --only admin

# Generate large dataset
seed-large:
	docker-compose exec backend python scripts/generate_large_dataset.py --count 100000

# Import from CSV
import-products:
	docker-compose exec backend python scripts/import_csv.py --model Product --file /data/products.csv
```

### Django-style Management

```python
# app/management/commands/seed.py
@click.group()
def seed():
    """Database seeding commands."""
    pass

@seed.command()
@click.option("--clear", is_flag=True)
def all(clear: bool):
    """Seed all data."""
    asyncio.run(seed_all(clear))

@seed.command()
@click.option("--count", default=100)
def users(count: int):
    """Seed users."""
    asyncio.run(seed_users_only(count))

@seed.command()
@click.option("--featured", default=5)
def products(featured: int):
    """Seed products."""
    asyncio.run(seed_products_only(featured))

# Usage: python manage.py seed all --clear
```

## Best Practices

### 1. Idempotent Seeds
```python
async def seed_categories(db: AsyncSession):
    """Idempotent category seeding."""
    categories = [
        ("electronics", "Electronics"),
        ("books", "Books"),
    ]
    
    for slug, name in categories:
        # Check if exists
        existing = await db.execute(
            select(Category).where(Category.slug == slug)
        )
        if not existing.scalar_one_or_none():
            category = Category(slug=slug, name=name)
            db.add(category)
```

### 2. Realistic Data Patterns
```python
def generate_realistic_order_dates(count: int) -> list[datetime]:
    """Generate realistic order distribution."""
    dates = []
    
    # 60% recent (last month)
    recent_count = int(count * 0.6)
    dates.extend([
        fake.date_time_between(start_date="-30d", end_date="now")
        for _ in range(recent_count)
    ])
    
    # 30% older (last year)
    older_count = int(count * 0.3)
    dates.extend([
        fake.date_time_between(start_date="-1y", end_date="-30d")
        for _ in range(older_count)
    ])
    
    # 10% very old
    remaining = count - recent_count - older_count
    dates.extend([
        fake.date_time_between(start_date="-3y", end_date="-1y")
        for _ in range(remaining)
    ])
    
    return dates
```

### 3. Performance Optimization
- Use bulk operations
- Disable constraints during seeding
- Use raw SQL for very large datasets
- Consider using COPY for PostgreSQL

### 4. Data Privacy
- Never use real user data
- Anonymize any imported data
- Use consistent fake data generators
- Document any external data sources