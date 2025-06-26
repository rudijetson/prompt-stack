# Background Jobs & Task Queues

This guide covers patterns for handling background jobs, async tasks, and job queues in the Prompt-Stack application.

## Overview

Background jobs are essential for:
- Long-running operations (AI processing, data exports)
- Email sending
- Scheduled tasks (cleanup, reports)
- Resource-intensive computations
- External API calls with retries

## Task Queue Options

### 1. FastAPI BackgroundTasks (Simple)

Best for: Quick, fire-and-forget tasks that complete within the request lifecycle.

```python
from fastapi import BackgroundTasks

@router.post("/send-welcome-email")
async def register_user(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Create user immediately
    user = await create_user(db, user_data)
    
    # Queue email for background processing
    background_tasks.add_task(
        send_welcome_email,
        user.email,
        user.name
    )
    
    return {"message": "User created", "id": user.id}

async def send_welcome_email(email: str, name: str):
    """Send welcome email in background."""
    await email_service.send(
        to=email,
        subject="Welcome to Prompt-Stack!",
        template="welcome",
        context={"name": name}
    )
```

### 2. Celery (Production-Ready)

Best for: Complex workflows, retries, scheduling, distributed processing.

#### Celery Setup

```python
# app/core/celery_app.py
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "prompt_stack",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks"]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Celery beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "cleanup-old-files": {
        "task": "app.tasks.cleanup.cleanup_old_files",
        "schedule": 3600.0,  # Every hour
    },
    "generate-daily-reports": {
        "task": "app.tasks.reports.generate_daily_reports",
        "schedule": crontab(hour=2, minute=0),  # 2 AM daily
    },
}
```

#### Task Examples

```python
# app/tasks/ai_tasks.py
from app.core.celery_app import celery_app
from celery import Task
import logging

logger = logging.getLogger(__name__)

class CallbackTask(Task):
    """Task with callbacks for success/failure."""
    
    def on_success(self, retval, task_id, args, kwargs):
        """Called on successful completion."""
        logger.info(f"Task {task_id} succeeded with result: {retval}")
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called on failure."""
        logger.error(f"Task {task_id} failed: {exc}")

@celery_app.task(
    bind=True,
    base=CallbackTask,
    name="generate_embeddings",
    max_retries=3,
    default_retry_delay=60,
)
def generate_embeddings(self, document_id: str):
    """Generate embeddings for a document with retries."""
    try:
        # Get document
        document = get_document(document_id)
        
        # Update status
        update_document_status(document_id, "processing")
        
        # Split into chunks
        chunks = split_document(document.content)
        total_chunks = len(chunks)
        
        # Process each chunk
        embeddings = []
        for i, chunk in enumerate(chunks):
            # Generate embedding
            embedding = generate_embedding(chunk)
            embeddings.append(embedding)
            
            # Update progress
            self.update_state(
                state="PROGRESS",
                meta={
                    "current": i + 1,
                    "total": total_chunks,
                    "percent": int(((i + 1) / total_chunks) * 100)
                }
            )
        
        # Store embeddings
        store_embeddings(document_id, embeddings)
        
        # Update status
        update_document_status(document_id, "completed")
        
        return {
            "document_id": document_id,
            "chunks_processed": total_chunks,
            "status": "success"
        }
        
    except RateLimitError as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
        
    except Exception as exc:
        # Mark as failed
        update_document_status(document_id, "failed", str(exc))
        raise
```

### 3. Redis Queue (RQ) - Lightweight Alternative

```python
# app/core/rq_app.py
from redis import Redis
from rq import Queue
from app.core.config import settings

redis_conn = Redis.from_url(settings.REDIS_URL)
task_queue = Queue(connection=redis_conn)

# app/tasks/simple_tasks.py
def process_payment(payment_id: str):
    """Process payment in background."""
    payment = get_payment(payment_id)
    
    try:
        result = stripe.PaymentIntent.create(
            amount=payment.amount,
            currency=payment.currency,
            customer=payment.customer_id,
        )
        
        update_payment_status(payment_id, "completed", result.id)
        send_payment_confirmation(payment.user_email)
        
    except stripe.error.StripeError as e:
        update_payment_status(payment_id, "failed", str(e))
        raise

# Usage
from app.core.rq_app import task_queue

@router.post("/process-payment/{payment_id}")
async def trigger_payment_processing(payment_id: str):
    job = task_queue.enqueue(
        process_payment,
        payment_id,
        job_timeout="10m",
        result_ttl=86400,  # Keep result for 1 day
    )
    
    return {"job_id": job.id, "status": "queued"}
```

## Task Patterns

### 1. Chain Tasks

```python
# app/tasks/workflows.py
from celery import chain, group, chord

@celery_app.task
def extract_text(file_id: str) -> str:
    """Extract text from uploaded file."""
    file = get_file(file_id)
    return extract_text_from_file(file)

@celery_app.task
def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment of text."""
    return sentiment_analyzer.analyze(text)

@celery_app.task
def generate_summary(text: str) -> str:
    """Generate summary using AI."""
    return ai_service.summarize(text)

@celery_app.task
def save_analysis(file_id: str, sentiment: dict, summary: str):
    """Save analysis results."""
    update_file_analysis(
        file_id,
        sentiment=sentiment,
        summary=summary,
        analyzed_at=datetime.utcnow()
    )

# Chain tasks together
def process_uploaded_file(file_id: str):
    workflow = chain(
        extract_text.s(file_id),
        group(
            analyze_sentiment.s(),
            generate_summary.s(),
        ),
        save_analysis.s(file_id)
    )
    
    workflow.apply_async()
```

### 2. Batch Processing

```python
@celery_app.task
def process_batch_export(export_id: str):
    """Process large data export in batches."""
    export = get_export_request(export_id)
    
    # Update status
    update_export_status(export_id, "processing")
    
    # Process in batches
    batch_size = 1000
    offset = 0
    file_parts = []
    
    while True:
        # Get batch
        records = get_records(
            filters=export.filters,
            limit=batch_size,
            offset=offset
        )
        
        if not records:
            break
        
        # Process batch
        csv_part = convert_to_csv(records)
        file_parts.append(csv_part)
        
        # Update progress
        offset += len(records)
        update_export_progress(export_id, offset)
        
    # Combine parts and upload
    final_file = combine_csv_parts(file_parts)
    file_url = upload_to_s3(final_file, f"exports/{export_id}.csv")
    
    # Update status
    update_export_status(export_id, "completed", file_url)
    
    # Send notification
    send_export_complete_email(export.user_email, file_url)
```

### 3. Scheduled Tasks

```python
# app/tasks/scheduled.py
from celery.schedules import crontab

@celery_app.task
def cleanup_expired_sessions():
    """Clean up expired sessions."""
    deleted = delete_expired_sessions()
    logger.info(f"Cleaned up {deleted} expired sessions")

@celery_app.task
def generate_monthly_invoice():
    """Generate invoices for all active subscriptions."""
    subscriptions = get_active_subscriptions()
    
    for subscription in subscriptions:
        try:
            invoice = create_invoice(subscription)
            send_invoice_email(subscription.user_email, invoice)
        except Exception as e:
            logger.error(f"Failed to generate invoice for {subscription.id}: {e}")

# Schedule in celery config
celery_app.conf.beat_schedule = {
    "cleanup-sessions": {
        "task": "cleanup_expired_sessions",
        "schedule": crontab(minute="0"),  # Every hour
    },
    "monthly-invoices": {
        "task": "generate_monthly_invoice",
        "schedule": crontab(day_of_month="1", hour="0", minute="0"),  # First day of month
    },
}
```

### 4. Task with Progress Tracking

```python
# Backend task
@celery_app.task(bind=True)
def process_video(self, video_id: str):
    """Process video with progress updates."""
    video = get_video(video_id)
    
    # Stage 1: Download
    self.update_state(
        state="PROGRESS",
        meta={"stage": "downloading", "percent": 0}
    )
    local_path = download_video(video.url)
    
    # Stage 2: Extract frames
    self.update_state(
        state="PROGRESS",
        meta={"stage": "extracting", "percent": 25}
    )
    frames = extract_frames(local_path)
    
    # Stage 3: Process frames
    for i, frame in enumerate(frames):
        process_frame(frame)
        percent = 25 + (50 * (i + 1) / len(frames))
        self.update_state(
            state="PROGRESS",
            meta={"stage": "processing", "percent": int(percent)}
        )
    
    # Stage 4: Generate output
    self.update_state(
        state="PROGRESS",
        meta={"stage": "generating", "percent": 75}
    )
    output = generate_video_output(frames)
    
    # Stage 5: Upload
    self.update_state(
        state="PROGRESS",
        meta={"stage": "uploading", "percent": 90}
    )
    output_url = upload_processed_video(output)
    
    return {"video_id": video_id, "output_url": output_url}

# Frontend progress tracking
async function trackVideoProgress(taskId: string) {
  const checkProgress = async () => {
    const response = await fetch(`/api/tasks/${taskId}`)
    const data = await response.json()
    
    if (data.state === 'PENDING') {
      updateUI({ status: 'Queued...', progress: 0 })
    } else if (data.state === 'PROGRESS') {
      updateUI({
        status: `${data.meta.stage}...`,
        progress: data.meta.percent
      })
    } else if (data.state === 'SUCCESS') {
      updateUI({ status: 'Complete!', progress: 100 })
      return data.result
    } else if (data.state === 'FAILURE') {
      throw new Error(data.error)
    }
    
    // Check again in 1 second
    setTimeout(checkProgress, 1000)
  }
  
  return checkProgress()
}
```

## Error Handling & Retries

### Retry Strategies

```python
# Exponential backoff
@celery_app.task(
    autoretry_for=(RequestException,),
    retry_kwargs={"max_retries": 5},
    retry_backoff=True,
    retry_backoff_max=600,  # Max 10 minutes
)
def call_external_api(url: str, data: dict):
    """Call external API with automatic retries."""
    response = requests.post(url, json=data, timeout=30)
    response.raise_for_status()
    return response.json()

# Custom retry logic
@celery_app.task(bind=True, max_retries=3)
def process_with_fallback(self, data: dict):
    """Process with fallback on failure."""
    try:
        # Try primary processor
        return primary_processor(data)
    except PrimaryProcessorError as exc:
        if self.request.retries < self.max_retries - 1:
            # Retry with primary
            raise self.retry(exc=exc, countdown=60)
        else:
            # Final retry uses fallback
            logger.warning("Primary processor failed, using fallback")
            return fallback_processor(data)
```

### Dead Letter Queue

```python
# app/tasks/error_handling.py
@celery_app.task
def process_failed_task(task_name: str, task_id: str, args: list, kwargs: dict, error: str):
    """Handle failed tasks."""
    # Log failure
    logger.error(f"Task failed: {task_name}[{task_id}] - {error}")
    
    # Store in dead letter queue
    store_failed_task({
        "task_name": task_name,
        "task_id": task_id,
        "args": args,
        "kwargs": kwargs,
        "error": error,
        "failed_at": datetime.utcnow(),
    })
    
    # Alert if critical
    if task_name in CRITICAL_TASKS:
        send_alert_to_oncall(
            f"Critical task failed: {task_name}",
            error
        )

# Configure task failure handler
celery_app.conf.task_annotations = {
    "*": {"on_failure": process_failed_task}
}
```

## Monitoring & Observability

### Flower (Celery Monitoring)

```yaml
# docker-compose.yml
services:
  flower:
    image: mher/flower
    command: celery flower
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - FLOWER_PORT=5555
    ports:
      - "5555:5555"
    depends_on:
      - redis
```

### Custom Metrics

```python
# app/tasks/metrics.py
from prometheus_client import Counter, Histogram, Gauge

task_counter = Counter(
    "celery_tasks_total",
    "Total number of tasks",
    ["task_name", "status"]
)

task_duration = Histogram(
    "celery_task_duration_seconds",
    "Task execution time",
    ["task_name"]
)

active_tasks = Gauge(
    "celery_active_tasks",
    "Number of active tasks",
    ["task_name"]
)

class MetricsTask(Task):
    """Task with metrics collection."""
    
    def __call__(self, *args, **kwargs):
        active_tasks.labels(task_name=self.name).inc()
        start_time = time.time()
        
        try:
            result = super().__call__(*args, **kwargs)
            task_counter.labels(task_name=self.name, status="success").inc()
            return result
        except Exception as exc:
            task_counter.labels(task_name=self.name, status="failure").inc()
            raise
        finally:
            duration = time.time() - start_time
            task_duration.labels(task_name=self.name).observe(duration)
            active_tasks.labels(task_name=self.name).dec()

# Use as base class
@celery_app.task(base=MetricsTask)
def monitored_task():
    pass
```

## Best Practices

### 1. Task Design
- Keep tasks idempotent (safe to retry)
- Use database transactions appropriately
- Pass IDs, not objects
- Set reasonable timeouts
- Log task progress

### 2. Resource Management
```python
# Limit concurrent tasks
@celery_app.task(rate_limit="10/m")  # 10 per minute
def rate_limited_task():
    pass

# Use task routing
celery_app.conf.task_routes = {
    "app.tasks.heavy.*": {"queue": "heavy"},
    "app.tasks.light.*": {"queue": "light"},
}
```

### 3. Testing Background Jobs

```python
# tests/test_tasks.py
import pytest
from celery import current_app
from app.tasks import process_data

@pytest.fixture
def celery_app(celery_app):
    """Configure Celery for testing."""
    celery_app.conf.update(
        task_always_eager=True,  # Execute synchronously
        task_eager_propagates=True,  # Propagate exceptions
    )
    return celery_app

def test_process_data_task(celery_app, db_session):
    """Test data processing task."""
    # Create test data
    data = create_test_data()
    
    # Execute task
    result = process_data.delay(data.id)
    
    # Task executes synchronously in tests
    assert result.successful()
    assert result.result["status"] == "completed"
    
    # Verify side effects
    updated_data = get_data(data.id)
    assert updated_data.processed is True

def test_task_retry(celery_app, mocker):
    """Test task retry logic."""
    # Mock external service to fail
    mock_api = mocker.patch("app.tasks.external_api.call")
    mock_api.side_effect = [RequestException(), {"success": True}]
    
    # Execute task
    result = call_external_api.delay("https://api.example.com", {})
    
    # Should succeed on retry
    assert result.successful()
    assert mock_api.call_count == 2
```

### 4. Deployment Considerations

```yaml
# docker-compose.yml
services:
  worker:
    build: ./backend
    command: celery -A app.core.celery_app worker --loglevel=info
    environment:
      - C_FORCE_ROOT=1  # Allow root user (container)
    depends_on:
      - redis
      - db
    volumes:
      - ./backend:/app
    deploy:
      replicas: 2  # Scale workers

  beat:
    build: ./backend
    command: celery -A app.core.celery_app beat --loglevel=info
    depends_on:
      - redis
    volumes:
      - ./backend:/app
    deploy:
      replicas: 1  # Only one beat scheduler
```

### 5. Production Checklist
- [ ] Configure dead letter queues
- [ ] Set up monitoring (Flower/Prometheus)
- [ ] Configure log aggregation
- [ ] Set appropriate timeouts
- [ ] Implement circuit breakers
- [ ] Plan for task versioning
- [ ] Document task dependencies
- [ ] Set up alerts for failures