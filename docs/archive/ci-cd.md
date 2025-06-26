# CI/CD Pipeline Patterns

This guide covers continuous integration and deployment patterns for the Prompt-Stack application.

## Pipeline Overview

```mermaid
graph LR
    A[Push to GitHub] --> B[Run Tests]
    B --> C[Lint & Type Check]
    C --> D[Build Images]
    D --> E{Branch?}
    E -->|main| F[Deploy Staging]
    E -->|production| G[Deploy Production]
    E -->|PR| H[Preview Deploy]
    F --> I[Run E2E Tests]
    G --> J[Health Checks]
    H --> K[Comment PR]
```

## GitHub Actions Workflow

### Main CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  # Backend Tests
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          
      - name: Cache pip packages
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
          
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
          
      - name: Run linting
        run: |
          cd backend
          ruff check .
          mypy .
          
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost/test
          REDIS_URL: redis://localhost:6379
          ENVIRONMENT: test
        run: |
          cd backend
          pytest -v --cov=app --cov-report=xml
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
          flags: backend

  # Frontend Tests
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Run linting
        run: |
          cd frontend
          npm run lint
          npm run type-check
          
      - name: Run tests
        run: |
          cd frontend
          npm run test -- --coverage
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/lcov.info
          flags: frontend

  # Build Docker Images
  build:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Log in to Docker Hub
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            myapp/backend:latest
            myapp/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            myapp/frontend:latest
            myapp/frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Security Scanning
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/python
            p/typescript
            p/react
            p/nextjs
```

### Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy to ECS
        run: |
          # Update task definition
          aws ecs update-service \
            --cluster prompt-stack-${{ github.event.inputs.environment }} \
            --service backend \
            --force-new-deployment
            
      - name: Deploy frontend to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm i -g vercel
          cd frontend
          vercel deploy --prod \
            --token=$VERCEL_TOKEN \
            --env=${{ github.event.inputs.environment }}
            
      - name: Run health checks
        run: |
          ./scripts/health-check.sh ${{ github.event.inputs.environment }}
          
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment to ${{ github.event.inputs.environment }} ${{ job.status }}
            Actor: ${{ github.actor }}
            Commit: ${{ github.sha }}
```

### PR Preview Deployments

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Preview
        id: deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npm i -g vercel
          cd frontend
          DEPLOYMENT_URL=$(vercel deploy --token=$VERCEL_TOKEN)
          echo "url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT
          
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const url = '${{ steps.deploy.outputs.url }}'
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployment ready!\n\nView: ${url}`
            })
```

## Local Development Workflow

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  # Python
  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
        
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
        
  # JavaScript/TypeScript
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.54.0
    hooks:
      - id: eslint
        files: \.[jt]sx?$
        types: [file]
        additional_dependencies:
          - eslint@8.54.0
          - eslint-config-next@14.0.0
          
  # General
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
      
  # Secrets
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

### Git Hooks Setup

```bash
#!/bin/bash
# scripts/setup-hooks.sh

# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files

# Install commit-msg hook for conventional commits
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
# Check commit message format
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+'
if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Format: <type>(<scope>): <subject>"
    echo "Example: feat(auth): add login endpoint"
    exit 1
fi
EOF
chmod +x .git/hooks/commit-msg
```

## Testing Strategy

### Test Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /----\
      /      \  Integration Tests (30%)
     /--------\
    /          \  Unit Tests (60%)
   /____________\
```

### Parallel Testing

```yaml
# Run tests in parallel
test:
  parallel:
    - backend-unit:
        command: cd backend && pytest tests/unit -n auto
    - backend-integration:
        command: cd backend && pytest tests/integration
    - frontend-unit:
        command: cd frontend && npm run test:unit
    - frontend-integration:
        command: cd frontend && npm run test:integration
    - e2e:
        command: npm run test:e2e
```

## Deployment Strategies

### Blue-Green Deployment

```yaml
# terraform/modules/ecs/main.tf
resource "aws_ecs_service" "app" {
  name            = "prompt-stack"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.blue.arn
    container_name   = "backend"
    container_port   = 8000
  }
}

# CodeDeploy configuration
resource "aws_codedeploy_deployment_group" "app" {
  app_name               = aws_codedeploy_app.app.name
  deployment_group_name  = "prompt-stack"
  service_role_arn      = aws_iam_role.codedeploy.arn

  blue_green_deployment_config {
    terminate_blue_instances_on_deployment_success {
      action                                = "TERMINATE"
      termination_wait_time_in_minutes     = 5
    }

    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }

    green_fleet_provisioning_option {
      action = "COPY_AUTO_SCALING_GROUP"
    }
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = [aws_lb_listener.app.arn]
      }

      target_group {
        name = aws_lb_target_group.blue.name
      }

      target_group {
        name = aws_lb_target_group.green.name
      }
    }
  }
}
```

### Canary Deployments

```yaml
# k8s/deployment.yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: prompt-stack
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: prompt-stack
  service:
    port: 8000
  analysis:
    interval: 1m
    threshold: 10
    maxWeight: 50
    stepWeight: 10
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 1m
    - name: request-duration
      thresholdRange:
        max: 500
      interval: 1m
    webhooks:
    - name: load-test
      url: http://flagger-loadtester.test/
      timeout: 5s
      metadata:
        cmd: "hey -z 1m -q 10 -c 2 http://prompt-stack.prod:8000/"
```

## Environment Management

### Environment Variables

```bash
# scripts/deploy.sh
#!/bin/bash

# Load environment-specific variables
case $ENVIRONMENT in
  production)
    source .env.production
    CLUSTER="prompt-stack-prod"
    ;;
  staging)
    source .env.staging
    CLUSTER="prompt-stack-staging"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

# Validate required variables
required_vars=(
  DATABASE_URL
  REDIS_URL
  OPENAI_API_KEY
  STRIPE_SECRET_KEY
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Missing required variable: $var"
    exit 1
  fi
done
```

### Secrets Management

```yaml
# .github/workflows/secrets-rotation.yml
name: Rotate Secrets

on:
  schedule:
    - cron: '0 0 1 * *'  # Monthly
  workflow_dispatch:

jobs:
  rotate-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Rotate database password
        run: |
          NEW_PASSWORD=$(openssl rand -base64 32)
          
          # Update database
          aws rds modify-db-instance \
            --db-instance-identifier prompt-stack-prod \
            --master-user-password "$NEW_PASSWORD"
            
          # Update secret
          aws secretsmanager update-secret \
            --secret-id prod/database/password \
            --secret-string "$NEW_PASSWORD"
            
          # Trigger deployment to update app
          gh workflow run deploy.yml -f environment=production
```

## Monitoring & Rollback

### Health Checks

```bash
#!/bin/bash
# scripts/health-check.sh

ENVIRONMENT=$1
MAX_RETRIES=30
RETRY_INTERVAL=10

# API health check
echo "Checking API health..."
for i in $(seq 1 $MAX_RETRIES); do
  if curl -f "https://api-${ENVIRONMENT}.prompt-stack.com/health"; then
    echo "API is healthy"
    break
  fi
  
  if [ $i -eq $MAX_RETRIES ]; then
    echo "API health check failed"
    exit 1
  fi
  
  echo "Retry $i/$MAX_RETRIES..."
  sleep $RETRY_INTERVAL
done

# Frontend health check
echo "Checking frontend health..."
if ! curl -f "https://${ENVIRONMENT}.prompt-stack.com"; then
  echo "Frontend health check failed"
  exit 1
fi

echo "All health checks passed!"
```

### Automated Rollback

```yaml
# .github/workflows/rollback.yml
name: Automated Rollback

on:
  workflow_run:
    workflows: ["Deploy"]
    types: [completed]

jobs:
  monitor:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - name: Monitor metrics
        run: |
          # Check error rate
          ERROR_RATE=$(aws cloudwatch get-metric-statistics \
            --namespace AWS/ECS \
            --metric-name HTTPCode_Target_5XX_Count \
            --dimensions Name=ServiceName,Value=prompt-stack \
            --statistics Sum \
            --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
            --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
            --period 300 \
            --query 'Datapoints[0].Sum' \
            --output text)
            
          if [ "$ERROR_RATE" -gt "100" ]; then
            echo "High error rate detected: $ERROR_RATE"
            echo "SHOULD_ROLLBACK=true" >> $GITHUB_ENV
          fi
          
      - name: Rollback if needed
        if: env.SHOULD_ROLLBACK == 'true'
        run: |
          # Get previous task definition
          PREVIOUS_TASK_DEF=$(aws ecs describe-services \
            --cluster prompt-stack-prod \
            --services backend \
            --query 'services[0].taskDefinition' \
            --output text | awk -F: '{print $1":"$2-1}')
            
          # Update service
          aws ecs update-service \
            --cluster prompt-stack-prod \
            --service backend \
            --task-definition "$PREVIOUS_TASK_DEF"
            
          # Notify team
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"⚠️ Automated rollback triggered due to high error rate"}'
```

## Performance Optimization

### Build Caching

```dockerfile
# backend/Dockerfile
# Cache dependencies
FROM python:3.11-slim as deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Build stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .

# Use BuildKit cache mounts
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -e .
```

### Parallel Jobs

```yaml
# GitHub Actions matrix strategy
test:
  strategy:
    matrix:
      python-version: [3.10, 3.11, 3.12]
      test-suite: [unit, integration, smoke]
    fail-fast: false
  runs-on: ubuntu-latest
  steps:
    - name: Run ${{ matrix.test-suite }} tests
      run: |
        pytest tests/${{ matrix.test-suite }}
```

## Best Practices

### 1. Branch Protection
```json
{
  "protection_rules": {
    "main": {
      "required_reviews": 2,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_status_checks": [
        "backend-test",
        "frontend-test",
        "security"
      ],
      "enforce_admins": false,
      "restrictions": null
    }
  }
}
```

### 2. Deployment Checklist
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Database migrations tested
- [ ] Feature flags configured
- [ ] Monitoring alerts set up
- [ ] Rollback plan documented
- [ ] Stakeholders notified

### 3. Pipeline Security
- Use OIDC for cloud authentication
- Scan for secrets in code
- Pin action versions
- Use environment protection rules
- Audit deployment access

### 4. Cost Optimization
- Use self-hosted runners for heavy workloads
- Implement smart caching strategies
- Clean up old artifacts
- Use spot instances for non-critical jobs