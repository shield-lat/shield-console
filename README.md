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

Shield Console is designed to work with the [Shield Core](https://github.com/shield-lat/shield-core) Rust backend. When `NEXT_PUBLIC_SHIELD_API_URL` is set, the console will use the real API.

### Supported Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/auth/login` | POST | JWT authentication (email/password) |
| `/v1/auth/oauth/sync` | POST | OAuth user sync (Google, GitHub) |
| `/v1/auth/me` | GET | Current user info |
| `/v1/companies` | GET/POST | List/create companies |
| `/v1/companies/{id}` | GET/PUT/DELETE | Company CRUD |
| `/v1/companies/{id}/apps` | GET/POST | List/create apps |
| `/v1/companies/{id}/actions` | GET | List agent actions (Activity Log) |
| `/v1/companies/{id}/attacks` | GET | List attack events |
| `/v1/companies/{id}/metrics/overview` | GET | Dashboard KPIs |
| `/v1/companies/{id}/metrics/time-series` | GET | Actions over time |
| `/v1/companies/{id}/metrics/risk-distribution` | GET | Risk tier breakdown |
| `/v1/companies/{id}/settings` | GET/PUT | Company settings |
| `/v1/hitl/tasks` | GET | List HITL tasks |
| `/v1/hitl/tasks/{id}` | GET | Task details |
| `/v1/hitl/tasks/{id}/decision` | POST | Submit decision |

### Activity Log API

The Activity Log uses `GET /v1/companies/{company_id}/actions` with the following query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `app_id` | string | Filter by specific app (API key's app) |
| `decision` | string | Filter by: `allow`, `require_hitl`, `block` |
| `risk_tier` | string | Filter by: `low`, `medium`, `high`, `critical` |
| `user_id` | string | Filter by user |
| `search` | string | Search by user ID, trace ID, action type |
| `time_range` | string | `24h`, `7d`, `30d`, `90d` |
| `limit` | number | Pagination limit (default: 100) |
| `offset` | number | Pagination offset |

**Example:**
```bash
curl "http://localhost:8080/v1/companies/{company_id}/actions?app_id={app_id}&limit=50" \
  -H "Authorization: Bearer <jwt_token>"
```

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

// Activity Log
const { actions, total } = await shieldApi.getActivityLog(companyId, {
  applicationId: "app-123",
  decision: "Allow",
  riskTier: "High",
  timeRange: "7d",
  limit: 100,
}, token);

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

### 1. OAuth Providers (Recommended)

OAuth providers (Google, GitHub) are synced with Shield Core via the `/v1/auth/oauth/sync` endpoint. When a user signs in via OAuth:

1. NextAuth authenticates with the OAuth provider
2. The console calls Shield Core's `/v1/auth/oauth/sync` to register/sync the user
3. Shield Core returns a JWT token and the user's companies
4. The JWT is stored in the session and used for all API calls

**GitHub OAuth**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `https://your-domain.com/api/auth/callback/github`
4. Copy Client ID and Secret to environment variables

**Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Set callback URL: `https://your-domain.com/api/auth/callback/google`
4. Copy Client ID and Secret to environment variables

### 2. Shield Core Auth (Email/Password)

When `NEXT_PUBLIC_SHIELD_API_URL` is set, login uses the Shield Core `/v1/auth/login` endpoint.

### Auth Flow

1. User visits `/login`
2. User signs in via OAuth or email/password
3. OAuth users are synced with Shield Core (`/v1/auth/oauth/sync`)
4. JWT token is stored in session
5. New users are redirected to `/onboarding`
6. User creates or selects a company
7. User accesses the dashboard at `/{company-slug}/overview`

### Session Structure

```typescript
session.user = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  accessToken: string;         // Shield Core JWT
  companyId: string | null;    // Default company
  role: string;
  companies: Array<{           // User's companies
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}
```

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
│   │   ├── layout.tsx            # Validates company access
│   │   ├── overview/             # Dashboard with KPIs & charts
│   │   ├── applications/         # Applications list + detail
│   │   ├── hitl/                 # HITL Queue
│   │   ├── activity/             # Activity Log (real API)
│   │   ├── policies/             # Policies & Compliance
│   │   └── settings/             # Organization settings
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── companies/            # Company CRUD
│   │   ├── apps/                 # Application CRUD
│   │   ├── activity/             # Activity log proxy
│   │   └── hitl/                 # HITL tasks proxy
│   └── globals.css               # Theme & CSS variables
├── components/
│   ├── charts/                   # AreaChart, BarChart, RiskPieChart
│   ├── common/                   # KpiCard, Badge, ThemeToggle, EmptyState
│   ├── drawers/                  # ActionDetailDrawer, HitlDetailDrawer
│   ├── layout/                   # Sidebar, Topbar, DashboardShell
│   └── modals/                   # CreateAppModal
├── lib/
│   ├── shield-api/               # Shield Core API client
│   │   ├── client.ts             # HTTP client with JWT auth
│   │   ├── services.ts           # Service functions
│   │   ├── transformers.ts       # Type transformations
│   │   └── index.ts              # Module exports
│   ├── types.ts                  # TypeScript domain models
│   ├── api.ts                    # Unified API layer
│   ├── getCompanyFromSlug.ts     # Company lookup utility
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
NEXT_PUBLIC_SHIELD_API_URL=https://core.shield.lat

# =============================================================================
# NextAuth.js Configuration
# =============================================================================
# Required: Generate with `openssl rand -base64 32`
AUTH_SECRET=your-auth-secret-here

# Required: Your application URL
AUTH_URL=https://console.shield.lat
AUTH_TRUST_HOST=true

# =============================================================================
# OAuth Providers (Required for OAuth login)
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

## Features

### Company-Scoped Routing

All dashboard routes are scoped to a company slug:
- `/{company-slug}/overview` - Dashboard
- `/{company-slug}/applications` - Applications list
- `/{company-slug}/activity` - Activity log
- `/{company-slug}/hitl` - HITL queue
- `/{company-slug}/settings` - Settings

The layout validates company access by:
1. Checking if the company exists in the user's session
2. Falling back to API lookup for newly created companies

### Empty States

When a company has no applications, the dashboard shows helpful empty states that guide users to create their first app.

### Real-Time Activity Log

The Activity Log fetches real data from Shield Core with:
- Filtering by application, decision, risk tier
- Full-text search on user ID, trace ID, action type
- Time range presets (24h, 7d, 30d, 90d)
- Pagination support

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
3. Update `src/lib/api.ts` to use the new service

### Testing API Integration

```bash
# Start Shield Core backend
cd ../shield-core && cargo run

# Start console with API URL
NEXT_PUBLIC_SHIELD_API_URL=http://localhost:8080 pnpm dev
```

### Debugging Authentication

Check Railway/server logs for:
```
[Shield Auth] API Base URL: https://core.shield.lat
[Shield OAuth Sync] Calling: https://core.shield.lat/v1/auth/oauth/sync
[Shield OAuth Sync] Success: { userId: ..., companiesCount: 1 }
[Shield Auth] OAuth user synced successfully: { hasAccessToken: true, ... }
```

If you see `OAuth sync failed`, ensure:
1. Shield Core has authentication enabled (`AUTH_ENABLED=true`)
2. The `/v1/auth/oauth/sync` endpoint is implemented
3. The `NEXT_PUBLIC_SHIELD_API_URL` is correctly set

## Troubleshooting

### 404 on Company Dashboard

If you get a 404 when accessing `/{company-slug}/overview`:
1. Check if `accessToken` is in the session (check logs for `Has access token: false`)
2. Clear cookies and log in again
3. Ensure Shield Core authentication is enabled

### Session Has No Access Token

This happens when OAuth sync fails during login:
1. Clear all cookies for your domain
2. Ensure Shield Core is running and auth is enabled
3. Log in again

### Company Created But Not Visible

If you create a company but can't access it:
1. The company-user membership may not have been created
2. Check Shield Core database for the `company_members` table
3. Or delete the company and recreate it

## Contributing

1. Follow TypeScript strict mode
2. Use Biome for linting and formatting
3. Keep components small and composable
4. Maintain type definitions in `lib/types.ts`
5. Test with real Shield Core API

## License

MIT License – Shield Fintech Edition
