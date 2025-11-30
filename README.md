# Shield Console

> Control plane and monitoring UI for **Shield – Fintech Edition**, an AI Safety Gateway for financial services.

![Shield Console](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan) ![NextAuth](https://img.shields.io/badge/NextAuth-5-purple)

## Overview

Shield Console is the web dashboard for Shield, an AI Safety Gateway that sits between LLM agents and financial execution APIs. The gateway evaluates proposed actions through a layered safety pipeline and returns decisions:

- **ALLOW** – Execute automatically
- **REQUIRE_HITL** – Queue for Human-In-The-Loop review
- **BLOCK** – Hard reject

This console serves multiple personas in a fintech organization:

| Persona | Primary Focus |
|---------|---------------|
| **Platform Engineer** | Integration health, throughput, latency |
| **Product Manager** | Adoption, UX friction, action volume |
| **Risk & Compliance** | Risk tiers, ASR, high-risk actions |
| **Fraud/Ops Analyst** | HITL queue, fast review decisions |
| **Security/CISO** | Attacks, prompt injection patterns |
| **Internal Auditor** | Traceability, export capabilities |

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env.local

# Start development server
pnpm dev

# Open in browser
open http://localhost:3000
```

### Demo Mode (No Backend)

For development without Shield Core backend:
- **Email**: `demo@shield.lat`
- **Password**: `demo123`

### Production Mode (With Shield Core)

Set `NEXT_PUBLIC_SHIELD_API_URL` to connect to Shield Core:

```bash
NEXT_PUBLIC_SHIELD_API_URL=http://localhost:8080
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4
- **Authentication**: NextAuth.js v5 (GitHub, Google, Credentials)
- **Linting**: Biome

## Shield Core API Integration

Shield Console is designed to work with the [Shield Core](https://github.com/shield-lat/shield-core) Rust backend. When `NEXT_PUBLIC_SHIELD_API_URL` is set, the console will use the real API; otherwise, it falls back to mock data.

### Supported Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/auth/login` | POST | JWT authentication |
| `/v1/auth/me` | GET | Current user info |
| `/v1/companies` | GET/POST | List/create companies |
| `/v1/companies/{id}` | GET/PUT/DELETE | Company CRUD |
| `/v1/companies/{id}/apps` | GET/POST | List/create apps |
| `/v1/companies/{id}/actions` | GET | List agent actions |
| `/v1/companies/{id}/attacks` | GET | List attack events |
| `/v1/companies/{id}/metrics/overview` | GET | Dashboard KPIs |
| `/v1/companies/{id}/metrics/time-series` | GET | Actions over time |
| `/v1/companies/{id}/metrics/risk-distribution` | GET | Risk tier breakdown |
| `/v1/companies/{id}/settings` | GET/PUT | Company settings |
| `/v1/hitl/tasks` | GET | List HITL tasks |
| `/v1/hitl/tasks/{id}` | GET | Task details |
| `/v1/hitl/tasks/{id}/decision` | POST | Submit decision |

### API Client

The Shield API client is located at `src/lib/shield-api/`:

```typescript
import { shieldApi } from "@/lib/shield-api";

// Authentication
await shieldApi.login({ email, password });
const user = await shieldApi.getCurrentUser();

// Companies
const companies = await shieldApi.listCompanies();
const company = await shieldApi.createCompany({ name: "Acme Inc" });

// Metrics
const metrics = await shieldApi.getMetricsOverview(companyId, {
  timeRange: "7d",
  appId: null,
});

// HITL
const tasks = await shieldApi.listHitlTasks({ status: "Pending" });
await shieldApi.submitHitlDecision(taskId, { decision: "Approved" }, reviewerId);
```

### Type Transformations

The API module automatically transforms between backend (snake_case) and frontend (camelCase):

```typescript
// Backend response
{ "total_actions": 1000, "risk_tier": "high" }

// Frontend type
{ totalActions: 1000, riskTier: "High" }
```

## Authentication

Shield Console supports multiple authentication methods:

### 1. Shield Core Auth (Recommended)

When `NEXT_PUBLIC_SHIELD_API_URL` is set, login uses the Shield Core `/v1/auth/login` endpoint. JWT tokens are stored and used for all subsequent API calls.

### 2. OAuth Providers

For OAuth (GitHub, Google), configure the provider credentials:

**GitHub OAuth**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

**Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Set callback URL: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

### 3. Demo Credentials (Development)

For local development without any backend:
- **Email**: `demo@shield.lat`
- **Password**: `demo123`

### Auth Flow

1. User visits `/login`
2. After sign-in, new users are redirected to `/onboarding`
3. User completes company registration
4. Upon completion, user accesses the dashboard at `/{company-slug}/overview`

## Project Structure

```
src/
├── app/
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx            # Auth pages layout
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── onboarding/           # Company setup wizard
│   ├── [company]/                # Company-scoped dashboard
│   │   ├── layout.tsx            # Sidebar + Topbar shell
│   │   ├── overview/             # Dashboard with KPIs & charts
│   │   ├── applications/         # Applications list + detail
│   │   ├── hitl/                 # HITL Queue
│   │   ├── activity/             # Activity Log
│   │   └── settings/             # Organization settings
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   └── companies/            # Company CRUD
│   └── globals.css               # Theme & CSS variables
├── components/
│   ├── charts/                   # AreaChart, BarChart, RiskPieChart
│   ├── common/                   # KpiCard, Badge, ThemeToggle
│   ├── drawers/                  # ActionDetailDrawer, HitlDetailDrawer
│   ├── layout/                   # Sidebar, Topbar, DashboardShell
│   └── tables/                   # ActionsTable
├── lib/
│   ├── shield-api/               # Shield Core API client
│   │   ├── client.ts             # HTTP client with JWT auth
│   │   ├── services.ts           # Service functions
│   │   ├── transformers.ts       # Type transformations
│   │   └── index.ts              # Module exports
│   ├── types.ts                  # TypeScript domain models
│   ├── mockData.ts               # Mock data for development
│   ├── api.ts                    # Unified API layer (real + mock)
│   └── hooks/                    # React hooks
├── auth.ts                       # NextAuth.js configuration
└── middleware.ts                 # Route protection
```

## Environment Variables

Create a `.env.local` file:

```bash
# =============================================================================
# Shield Core API (Required for production)
# =============================================================================
NEXT_PUBLIC_SHIELD_API_URL=http://localhost:8080

# =============================================================================
# NextAuth.js Configuration
# =============================================================================
# Required: Generate with `openssl rand -base64 32`
AUTH_SECRET=your-auth-secret-here

# Required: Your application URL
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# =============================================================================
# OAuth Providers (Optional)
# =============================================================================
# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Domain Models

```typescript
// User - Authenticated user
interface User {
  id: string;
  email: string;
  name: string | null;
  companyId: string | null;
  role: "owner" | "admin" | "member" | "viewer";
}

// Company - Organization using Shield
interface Company {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "starter" | "pro" | "enterprise";
}

// Application - Base unit of protection
interface Application {
  id: string;
  name: string;
  environment: "sandbox" | "production";
  status: "healthy" | "degraded" | "offline";
  metrics: ApplicationMetrics;
}

// AgentAction - Single action evaluated by Shield
interface AgentAction {
  id: string;
  applicationId: string;
  userId: string;
  actionType: ActionType;
  amount?: number;
  decision: "Allow" | "RequireHitl" | "Block";
  riskTier: "Low" | "Medium" | "High" | "Critical";
  reasons: string[];
}

// HitlTask - Pending human review
interface HitlTask {
  id: string;
  agentAction: AgentAction;
  status: "Pending" | "Approved" | "Rejected";
  reviewerId?: string;
  reviewNotes?: string;
}

// AttackEvent - Detected security attack
interface AttackEvent {
  id: string;
  applicationId: string;
  attackType: AttackType;
  severity: RiskTier;
  outcome: "Blocked" | "Escalated" | "Allowed";
}
```

## Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # Run Biome linter
pnpm format    # Format code with Biome
```

## Design System

### Colors

| Purpose | CSS Variable | Color |
|---------|-------------|-------|
| Primary | `--primary` | Teal (#0d9488) |
| Risk Low | `--risk-low` | Green (#10b981) |
| Risk Medium | `--risk-medium` | Amber (#f59e0b) |
| Risk High | `--risk-high` | Orange (#f97316) |
| Risk Critical | `--risk-critical` | Red (#ef4444) |

### Theme Support

- Automatic system preference detection
- Manual toggle in the top bar
- Preference persisted in localStorage

### Sidebar

The sidebar is collapsible and includes:
- Company/workspace switcher
- Navigation links with active state
- Shield Core connection status
- Collapse toggle with localStorage persistence

## Development

### Adding New API Endpoints

1. Add the endpoint to `src/lib/shield-api/services.ts`
2. Add transformer functions in `transformers.ts` if needed
3. Update `src/lib/api.ts` to use the new service with mock fallback

### Testing API Integration

```bash
# Start Shield Core backend
cd ../shield-core && cargo run

# Start console with API URL
NEXT_PUBLIC_SHIELD_API_URL=http://localhost:8080 pnpm dev
```

## Contributing

1. Follow TypeScript strict mode
2. Use Biome for linting and formatting
3. Keep components small and composable
4. Maintain type definitions in `lib/types.ts`
5. Test with both mock data and real API

## License

MIT License – Shield Fintech Edition
