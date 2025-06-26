# Logging & Observability

Structured logging and observability are crucial for debugging and monitoring. This guide defines logging patterns and observability practices.

## Logging Principles

1. **Structured over unstructured**: Use JSON format for machine parsing
2. **Contextual information**: Include request ID, user ID, etc.
3. **Appropriate levels**: Use correct log levels (DEBUG, INFO, WARN, ERROR)
4. **No sensitive data**: Never log passwords, tokens, or PII
5. **Actionable messages**: Log what happened and why

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| **DEBUG** | Detailed debugging info | "Calculating token cost: 150 tokens at $0.002/1k" |
| **INFO** | Normal operations | "User 123 successfully logged in" |
| **WARNING** | Concerning but handled | "Rate limit approaching: 95% of quota used" |
| **ERROR** | Errors needing attention | "Failed to connect to OpenAI API: timeout" |
| **CRITICAL** | System failures | "Database connection lost" |

## Backend Logging (Python)

### Setup Structured Logging

```python
# app/core/logging.py
import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict
from contextvars import ContextVar

# Context variables for request-scoped data
request_id_var: ContextVar[str] = ContextVar('request_id', default='')
user_id_var: ContextVar[str] = ContextVar('user_id', default='')

class StructuredFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add context variables
        if request_id := request_id_var.get():
            log_obj["request_id"] = request_id
            
        if user_id := user_id_var.get():
            log_obj["user_id"] = user_id
        
        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in ["name", "msg", "args", "created", "filename", 
                          "funcName", "levelname", "levelno", "lineno", 
                          "module", "msecs", "pathname", "process", 
                          "processName", "relativeCreated", "thread", 
                          "threadName", "exc_info", "exc_text", "stack_info"]:
                log_obj[key] = value
        
        # Add exception info if present
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

def setup_logging(level: str = "INFO"):
    """Configure structured logging."""
    # Remove default handlers
    logging.root.handlers = []
    
    # Create structured handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    
    # Configure root logger
    logging.root.setLevel(level)
    logging.root.addHandler(handler)
    
    # Silence noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

# Initialize on import
setup_logging()
```

### Logging Middleware

```python
# app/middleware/logging.py
import uuid
import time
from fastapi import Request, Response
from app.core.logging import request_id_var, user_id_var
import logging

logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next):
    """Add request ID and log requests."""
    # Generate request ID
    request_id = str(uuid.uuid4())
    request_id_var.set(request_id)
    
    # Start timer
    start_time = time.time()
    
    # Log request
    logger.info(
        "Request started",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "client_host": request.client.host if request.client else None,
        }
    )
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = int((time.time() - start_time) * 1000)
    
    # Log response
    logger.info(
        "Request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        }
    )
    
    # Add request ID to response headers
    response.headers["X-Request-ID"] = request_id
    
    return response
```

### Service Layer Logging

```python
# app/services/llm/llm_service.py
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LLMService:
    async def generate_text(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate text with comprehensive logging."""
        logger.info(
            "Starting text generation",
            extra={
                "prompt_length": len(prompt),
                "model": kwargs.get("model", "default"),
                "max_tokens": kwargs.get("max_tokens", 500),
            }
        )
        
        try:
            # Log API call
            logger.debug(
                "Calling LLM API",
                extra={
                    "provider": self.provider,
                    "estimated_tokens": self._estimate_tokens(prompt),
                }
            )
            
            start_time = time.time()
            response = await self._call_api(prompt, **kwargs)
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Log success
            logger.info(
                "Text generation completed",
                extra={
                    "duration_ms": duration_ms,
                    "completion_tokens": response.usage.completion_tokens,
                    "prompt_tokens": response.usage.prompt_tokens,
                    "total_cost": self._calculate_cost(response.usage),
                }
            )
            
            return response
            
        except RateLimitError as e:
            logger.warning(
                "Rate limit exceeded",
                extra={
                    "retry_after": e.retry_after,
                    "provider": self.provider,
                }
            )
            raise
            
        except Exception as e:
            logger.error(
                "Text generation failed",
                extra={
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                },
                exc_info=True
            )
            raise
```

### Database Query Logging

```python
# app/core/database.py
import logging
from sqlalchemy import event
from sqlalchemy.engine import Engine

logger = logging.getLogger("sqlalchemy.engine")

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log SQL queries."""
    logger.debug(
        "Executing SQL query",
        extra={
            "sql": statement,
            "parameters": parameters,
            "executemany": executemany,
        }
    )

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log query completion."""
    logger.debug(
        "SQL query completed",
        extra={
            "rowcount": cursor.rowcount,
        }
    )
```

## Frontend Logging (TypeScript)

### Logger Setup

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  [key: string]: any
}

class Logger {
  private context: LogContext = {}
  
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }
  
  private formatMessage(level: LogLevel, message: string, extra?: any) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...extra,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }
  }
  
  private log(level: LogLevel, message: string, extra?: any) {
    const logEntry = this.formatMessage(level, message, extra)
    
    // In development, use console
    if (process.env.NODE_ENV === 'development') {
      console[level](message, logEntry)
      return
    }
    
    // In production, send to logging service
    this.sendToLoggingService(logEntry)
  }
  
  private async sendToLoggingService(logEntry: any) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      })
    } catch (error) {
      // Fallback to console if logging fails
      console.error('Failed to send log:', error)
    }
  }
  
  debug(message: string, extra?: any) {
    this.log('debug', message, extra)
  }
  
  info(message: string, extra?: any) {
    this.log('info', message, extra)
  }
  
  warn(message: string, extra?: any) {
    this.log('warn', message, extra)
  }
  
  error(message: string, error?: Error, extra?: any) {
    this.log('error', message, {
      ...extra,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
    })
  }
}

export const logger = new Logger()
```

### API Client Logging

```typescript
// lib/api.ts
import { logger } from './logger'

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const requestId = generateRequestId()
  const startTime = performance.now()
  
  logger.info('API request started', {
    endpoint,
    method: options.method || 'GET',
    requestId,
  })
  
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'X-Request-ID': requestId,
        ...options.headers,
      },
    })
    
    const duration = Math.round(performance.now() - startTime)
    const data = await response.json()
    
    logger.info('API request completed', {
      endpoint,
      method: options.method || 'GET',
      requestId,
      status: response.status,
      duration,
      success: data.success,
    })
    
    if (!data.success) {
      logger.warn('API request failed', {
        endpoint,
        requestId,
        error: data.error,
        code: data.code,
      })
    }
    
    return data
    
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    
    logger.error('API request error', error as Error, {
      endpoint,
      requestId,
      duration,
    })
    
    throw error
  }
}
```

### Component Logging

```typescript
// components/PaymentForm.tsx
import { logger } from '@/lib/logger'

export function PaymentForm() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    logger.info('Payment form submitted', {
      component: 'PaymentForm',
      action: 'submit',
    })
    
    try {
      const result = await processPayment(formData)
      
      logger.info('Payment processed successfully', {
        component: 'PaymentForm',
        paymentId: result.paymentId,
        amount: result.amount,
      })
      
    } catch (error) {
      logger.error('Payment processing failed', error as Error, {
        component: 'PaymentForm',
        formData: sanitizeFormData(formData), // Remove sensitive data
      })
    }
  }
}
```

## Metrics & Monitoring

### Backend Metrics

```python
# app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time
from functools import wraps

# Define metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

active_users = Gauge(
    'active_users_total',
    'Number of active users'
)

llm_requests = Counter(
    'llm_requests_total',
    'Total LLM API requests',
    ['provider', 'model', 'status']
)

llm_tokens = Counter(
    'llm_tokens_total',
    'Total tokens processed',
    ['provider', 'model', 'type']
)

def track_request_metrics(func):
    """Decorator to track request metrics."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = await func(*args, **kwargs)
            status = 'success'
            return result
        except Exception as e:
            status = 'error'
            raise
        finally:
            duration = time.time() - start_time
            
            # Update metrics
            request_count.labels(
                method=request.method,
                endpoint=request.url.path,
                status=status
            ).inc()
            
            request_duration.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)
    
    return wrapper
```

### OpenTelemetry Integration

```python
# app/core/telemetry.py
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc import trace_exporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

def setup_telemetry(app):
    """Configure OpenTelemetry tracing."""
    # Set up the tracer provider
    trace.set_tracer_provider(TracerProvider())
    tracer = trace.get_tracer(__name__)
    
    # Configure OTLP exporter
    otlp_exporter = trace_exporter.OTLPSpanExporter(
        endpoint="localhost:4317",
        insecure=True
    )
    
    # Add batch processor
    span_processor = BatchSpanProcessor(otlp_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    
    # Instrument SQLAlchemy
    SQLAlchemyInstrumentor().instrument(
        engine=engine,
        service="prompt-stack"
    )
    
    return tracer
```

## Log Aggregation

### ELK Stack Configuration

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  es_data:
```

### Logstash Configuration

```ruby
# logstash.conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  # Parse timestamp
  date {
    match => [ "timestamp", "ISO8601" ]
  }
  
  # Add fields
  mutate {
    add_field => {
      "service" => "prompt-stack"
      "environment" => "${ENVIRONMENT:development}"
    }
  }
  
  # Parse user agent
  if [userAgent] {
    useragent {
      source => "userAgent"
      target => "user_agent"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "prompt-stack-%{+YYYY.MM.dd}"
  }
  
  # Alert on errors
  if [level] == "ERROR" {
    email {
      to => "alerts@example.com"
      subject => "Error in Prompt-Stack"
      body => "Error: %{message}\nDetails: %{exception}"
    }
  }
}
```

## Best Practices

### Do's
1. **Log at appropriate levels** - Don't log everything as INFO
2. **Include context** - User ID, request ID, relevant business data
3. **Use structured logging** - JSON format for parsing
4. **Log both success and failure** - Include duration for performance monitoring
5. **Sanitize sensitive data** - Never log passwords, tokens, or credit cards
6. **Use correlation IDs** - Track requests across services
7. **Log business events** - User signup, payment, etc.
8. **Set up alerts** - On error rates, performance degradation

### Don'ts
1. **Don't log sensitive data** - PII, passwords, tokens
2. **Don't log excessively** - Avoid logging in tight loops
3. **Don't use string concatenation** - Use structured fields
4. **Don't ignore errors** - Always log errors with context
5. **Don't log and throw** - Log OR throw, not both
6. **Don't hardcode log levels** - Make them configurable

### Log Message Examples

```python
# Good
logger.info(
    "User login successful",
    extra={
        "user_id": user.id,
        "login_method": "email",
        "ip_address": request.client.host,
    }
)

# Bad
logger.info(f"User {user.email} logged in from {request.client.host}")

# Good - Error with context
logger.error(
    "Payment processing failed",
    extra={
        "user_id": user.id,
        "payment_method": "stripe",
        "amount": order.total,
        "error_code": e.code,
    },
    exc_info=True
)

# Bad - No context
logger.error("Payment failed")
```

## Debugging with Logs

### Finding Related Logs
```bash
# Find all logs for a request
grep "request_id\":\"abc-123" app.log | jq .

# Find all errors for a user
grep "user_id\":\"user-456" app.log | grep "level\":\"ERROR" | jq .

# Find slow requests
jq 'select(.duration_ms > 1000)' app.log
```

### Common Debugging Patterns
1. **Trace user journey** - Filter by user_id
2. **Debug specific request** - Filter by request_id
3. **Find error patterns** - Group by error_code
4. **Performance analysis** - Aggregate duration_ms
5. **Traffic patterns** - Count by endpoint and method