# LLM System Architecture

## Complete Flow Diagram

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[AI Test Page<br/>localhost:3000/ai-test]
        LLMService[llm.ts Service]
        AuthCheck{Demo Mode?}
        
        UI -->|User submits prompt| LLMService
        LLMService --> AuthCheck
    end
    
    subgraph "Environment Variables"
        FrontEnv[NEXT_PUBLIC_DEMO_MODE=true<br/>NEXT_PUBLIC_SUPABASE_URL]
        BackEnv[DEMO_MODE=true<br/>API Keys configured]
    end
    
    subgraph "API Endpoints"
        AuthCheck -->|Yes| DemoEndpoint["/api/llm/demo"<br/>No auth required]
        AuthCheck -->|No| GenerateEndpoint["/api/llm/generate"<br/>Requires JWT token]
        ProvidersEndpoint["/api/llm/providers"<br/>Lists available providers]
    end
    
    subgraph "Backend (FastAPI)"
        DemoHandler[demo_generate()<br/>Allows real providers]
        GenerateHandler[generate_text()<br/>Requires authentication]
        ProviderCheck{Provider<br/>Configured?}
        
        DemoEndpoint --> DemoHandler
        GenerateEndpoint --> GenerateHandler
        DemoHandler --> ProviderCheck
        GenerateHandler --> ProviderCheck
    end
    
    subgraph "LLM Service Layer"
        LLMServiceBackend[llm_service.py]
        ProviderRouter{Route by Provider}
        
        ProviderCheck -->|Yes| LLMServiceBackend
        ProviderCheck -->|No| DemoProvider
        LLMServiceBackend --> ProviderRouter
    end
    
    subgraph "AI Providers"
        OpenAI[OpenAI API<br/>GPT-4o, GPT-4o-mini]
        Anthropic[Anthropic API<br/>Claude Opus/Sonnet/Haiku]
        Gemini[Google Gemini API<br/>2.5-pro, 2.5-flash<br/>2.0-flash, 1.5-pro, 1.5-flash]
        DeepSeek[DeepSeek API<br/>chat, reasoner]
        DemoProvider[Demo Provider<br/>Mock responses]
        
        ProviderRouter -->|provider=openai| OpenAI
        ProviderRouter -->|provider=anthropic| Anthropic
        ProviderRouter -->|provider=gemini| Gemini
        ProviderRouter -->|provider=deepseek| DeepSeek
        ProviderRouter -->|provider=demo| DemoProvider
    end
    
    subgraph "Response Flow"
        Response[Formatted Response<br/>text, model, usage]
        SafetyHandler[Safety Filter Handler<br/>For Gemini]
        
        OpenAI --> Response
        Anthropic --> Response
        Gemini --> SafetyHandler
        SafetyHandler --> Response
        DeepSeek --> Response
        DemoProvider --> Response
    end
    
    Response --> DemoHandler
    Response --> GenerateHandler
    DemoHandler --> UI
    GenerateHandler --> UI
    
    FrontEnv -.->|Configures| AuthCheck
    BackEnv -.->|Configures| ProviderCheck
    
    style UI fill:#e1f5fe
    style DemoEndpoint fill:#c8e6c9
    style GenerateEndpoint fill:#ffccbc
    style OpenAI fill:#74aa9c
    style Anthropic fill:#9c74aa
    style Gemini fill:#aa9c74
    style DeepSeek fill:#aa7497
    style DemoProvider fill:#d0d0d0
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant DemoEndpoint as /api/llm/demo
    participant GenerateEndpoint as /api/llm/generate
    participant LLMService
    participant AIProvider
    
    alt Demo Mode (Current Setup)
        User->>Frontend: Submit prompt
        Frontend->>Frontend: Check NEXT_PUBLIC_DEMO_MODE
        Note over Frontend: Demo mode = true
        Frontend->>DemoEndpoint: POST {prompt, provider, model}
        Note over DemoEndpoint: No auth required
        DemoEndpoint->>LLMService: Check if provider configured
        alt Provider Configured
            LLMService->>AIProvider: Call real API
            AIProvider-->>LLMService: AI response
        else Provider Not Configured
            LLMService->>LLMService: Generate demo response
        end
        LLMService-->>DemoEndpoint: Return response
        DemoEndpoint-->>Frontend: {text, model, usage}
        Frontend-->>User: Display response
    else Production Mode (With Auth)
        User->>Frontend: Submit prompt
        Frontend->>Frontend: Check NEXT_PUBLIC_DEMO_MODE
        Note over Frontend: Demo mode = false
        Frontend->>Frontend: Get Supabase JWT token
        Frontend->>GenerateEndpoint: POST with Bearer token
        GenerateEndpoint->>GenerateEndpoint: Verify JWT
        GenerateEndpoint->>LLMService: Process request
        LLMService->>AIProvider: Call API
        AIProvider-->>LLMService: AI response
        LLMService-->>GenerateEndpoint: Return response
        GenerateEndpoint-->>Frontend: {text, model, usage}
        Frontend-->>User: Display response
    end
```

## Provider Configuration Flow

```mermaid
graph LR
    subgraph "Environment Setup"
        ENV[.env file]
        ENV -->|OPENAI_API_KEY| OAIConfig[OpenAI Config]
        ENV -->|ANTHROPIC_API_KEY| ANTConfig[Anthropic Config]
        ENV -->|GEMINI_API_KEY| GEMConfig[Gemini Config]
        ENV -->|DEEPSEEK_API_KEY| DSConfig[DeepSeek Config]
    end
    
    subgraph "Service Initialization"
        OAIConfig --> OAIClient[OpenAI Client]
        ANTConfig --> ANTClient[Anthropic Client]
        GEMConfig --> GEMClient[Gemini Client]
        DSConfig --> DSClient[DeepSeek Client]
    end
    
    subgraph "Provider Status"
        ProvidersAPI[GET /api/llm/providers]
        ProvidersAPI --> ProviderList[Provider List]
        
        ProviderList --> P1["{name: 'openai',<br/>configured: true,<br/>models: [...]}"]
        ProviderList --> P2["{name: 'anthropic',<br/>configured: true,<br/>models: [...]}"]
        ProviderList --> P3["{name: 'gemini',<br/>configured: true,<br/>models: [...]}"]
        ProviderList --> P4["{name: 'deepseek',<br/>configured: true,<br/>models: [...]}"]
    end
```

## Error Handling Flow

```mermaid
graph TD
    Request[API Request]
    Request --> Validation{Valid JSON?}
    
    Validation -->|No| JSONError[422 Validation Error]
    Validation -->|Yes| AuthCheck{Auth Valid?}
    
    AuthCheck -->|No| AuthError[401 Unauthorized]
    AuthCheck -->|Yes| ProviderCheck{Provider Exists?}
    
    ProviderCheck -->|No| ProviderError[400 Invalid Provider]
    ProviderCheck -->|Yes| ConfigCheck{API Key Set?}
    
    ConfigCheck -->|No| ConfigError[500 Missing API Key]
    ConfigCheck -->|Yes| APICall[Call AI Provider]
    
    APICall --> APIResponse{Response OK?}
    
    APIResponse -->|Yes| Success[200 Success Response]
    APIResponse -->|No| APIErrorType{Error Type?}
    
    APIErrorType -->|Safety Filter| SafetyMsg["Response blocked by safety filters"]
    APIErrorType -->|Rate Limit| RateMsg["Rate limit exceeded"]
    APIErrorType -->|Invalid Key| KeyMsg["Invalid API key"]
    APIErrorType -->|Other| GenericMsg["API error: {details}"]
    
    SafetyMsg --> Success
    RateMsg --> ErrorResponse[500 Error Response]
    KeyMsg --> ErrorResponse
    GenericMsg --> ErrorResponse
    
    style Success fill:#c8e6c9
    style JSONError fill:#ffccbc
    style AuthError fill:#ffccbc
    style ErrorResponse fill:#ffccbc
```

## Component Details

### Frontend Components
- **AI Test Page**: `/frontend/app/ai-test/page.tsx`
- **LLM Service**: `/frontend/services/llm.ts`
- **Auth Provider**: `/frontend/components/providers/auth-provider.tsx`

### Backend Components
- **LLM Endpoints**: `/backend/app/api/endpoints/llm.py`
- **LLM Service**: `/backend/app/services/llm_service.py`
- **Config**: `/backend/app/core/config.py`
- **Models**: `/backend/app/models/llm.py`

### Key Features
1. **Dual Mode Support**: Demo mode for testing, Production mode with auth
2. **Multi-Provider**: Supports 4 AI providers + demo fallback
3. **Safety Handling**: Graceful handling of Gemini safety filters
4. **Token Tracking**: Usage statistics for all providers (except Gemini)
5. **Rate Limiting**: 10 req/min (demo), 30 req/min (authenticated)

## Model Availability

| Provider | Models | Default |
|----------|--------|---------|
| OpenAI | o3, gpt-4o, gpt-4o-mini | gpt-4o-mini |
| Anthropic | claude-opus-4, claude-sonnet-4, claude-3-5-haiku | claude-3-5-haiku |
| Gemini | 2.5-pro, 2.5-flash, 2.0-flash, 1.5-pro, 1.5-flash | gemini-2.5-flash |
| DeepSeek | deepseek-chat, deepseek-reasoner | deepseek-chat |
| Demo | demo | demo |