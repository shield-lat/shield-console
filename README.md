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

# Copy environment file and configure OAuth
cp .env.example .env.local

# Start development server
pnpm dev

# Open in browser
open http://localhost:3000
```

### Demo Credentials

For local development without OAuth setup:
- **Email**: `demo@shield.lat`
- **Password**: `demo123`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4
- **Authentication**: NextAuth.js v5 (GitHub, Google, Credentials)
- **Linting**: Biome

## Authentication

Shield Console uses NextAuth.js v5 for authentication with support for:

- **GitHub OAuth** – Sign in with GitHub
- **Google OAuth** – Sign in with Google
- **Credentials** – Email/password for demo purposes

### OAuth Setup

1. **GitHub OAuth**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create a new OAuth App
   - Set callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Secret to `.env.local`

2. **Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 credentials
   - Set callback URL: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Secret to `.env.local`

### Auth Flow

1. User visits `/login` or `/register`
2. After OAuth sign-in, new users are redirected to `/onboarding`
3. User completes company registration (name, industry, team size, use case)
4. Upon completion, user gains access to the dashboard

### Protected Routes

All dashboard routes are protected by middleware. Unauthenticated users are redirected to `/login`.

## Project Structure

```
src/
├── app/
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx            # Auth pages layout (split screen)
│   │   ├── login/                # Login page with OAuth buttons
│   │   ├── register/             # Registration page
│   │   └── onboarding/           # Company setup wizard
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx            # Sidebar + Topbar shell
│   │   ├── overview/             # Global dashboard with KPIs & charts
│   │   ├── applications/         # Applications list + [id] detail
│   │   ├── hitl/                 # HITL Queue with review workflow
│   │   ├── activity/             # Activity Log (audit trail)
│   │   └── settings/             # Organization & policy settings
│   ├── api/auth/[...nextauth]/   # NextAuth.js API routes
│   ├── globals.css               # Fintech theme + CSS variables
│   └── layout.tsx                # Root layout
├── components/
│   ├── charts/                   # AreaChart, BarChart, RiskPieChart
│   ├── common/                   # KpiCard, Badge, ThemeToggle
│   ├── drawers/                  # ActionDetailDrawer, HitlDetailDrawer
│   ├── layout/                   # Sidebar, Topbar
│   └── tables/                   # ActionsTable
├── lib/
│   ├── types.ts                  # TypeScript domain models
│   ├── mockData.ts               # Realistic fintech mock data
│   ├── api.ts                    # Data fetching layer
│   └── hooks/                    # React hooks (useGlobalFilters, useTheme)
├── auth.ts                       # NextAuth.js configuration
└── middleware.ts                 # Route protection middleware
```

## Pages

### Authentication

#### Login (`/login`)
- GitHub and Google OAuth buttons
- Email/password form for demo access
- Demo credentials hint

#### Register (`/register`)
- OAuth signup options
- Feature highlights
- Terms acceptance

#### Onboarding (`/onboarding`)
- 3-step company setup wizard
- Company name and workspace URL
- Industry and team size selection
- Primary use case configuration

### Dashboard

#### Overview (`/overview`)
Global dashboard showing:
- KPIs: Total Actions, Blocked, HITL, Attacks, ASR, Users Impacted
- Charts: Actions over time (stacked area), Attacks by application (bar)
- Risk distribution pie chart
- Shield performance metrics
- Recent activity table

#### Applications (`/applications`)
- Grid of application cards with status, environment, and metrics
- Detail view (`/applications/[id]`) with app-specific KPIs, attack history, action breakdown

#### HITL Queue (`/hitl`)
- Filterable task list (application, status, risk, search)
- Status tabs: All, Pending, Approved, Rejected
- Detail drawer with Approve/Reject workflow
- Review notes and audit trail

#### Activity Log (`/activity`)
- Full audit history of Shield decisions
- Advanced filters (application, decision, risk, search)
- Export capability (placeholder)

#### Settings (`/settings`)
- Organization configuration
- API keys management
- Policy thresholds display
- Notification preferences

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
  actionType: ActionType; // GetBalance, TransferFunds, PayBill, etc.
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
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# =============================================================================
# NextAuth.js Configuration
# =============================================================================

# Required: Generate with `openssl rand -base64 32`
AUTH_SECRET=your-auth-secret-here

# Required: Your application URL
AUTH_URL=http://localhost:3000

# =============================================================================
# OAuth Providers
# =============================================================================

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# =============================================================================
# Shield Core API (Future)
# =============================================================================
# SHIELD_CORE_URL=http://localhost:8080
# SHIELD_CORE_API_KEY=your-api-key
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

Shield Console supports light and dark modes:
- Automatic system preference detection
- Manual toggle in the top bar
- Preference persisted in localStorage

### Components

- **KpiCard**: Metric display with icon, variant, and optional trend
- **Badge**: Status indicators (RiskBadge, DecisionBadge, StatusBadge, HitlStatusBadge)
- **ActionsTable**: Sortable table with row click for details
- **Drawers**: Slide-in panels for action/task details
- **ThemeToggle**: Light/dark/system mode switcher

## Connecting to Shield Core

The `lib/api.ts` file contains data fetching functions that currently return mock data. To connect to the real `shield-core` backend:

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_SHIELD_API_URL || "/api";

export async function getOverviewMetrics(params?: GetOverviewParams): Promise<OverviewMetrics> {
  const searchParams = new URLSearchParams();
  if (params?.applicationId) searchParams.set("applicationId", params.applicationId);
  if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
  
  const res = await fetch(`${API_BASE_URL}/metrics/overview?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}
```

### Expected API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/metrics/overview` | GET | Dashboard KPIs and charts |
| `/applications` | GET | List all applications |
| `/applications/:id` | GET | Single application details |
| `/actions/recent` | GET | Recent agent actions |
| `/hitl/tasks` | GET | HITL task list |
| `/hitl/tasks/:id` | GET | Single task details |
| `/hitl/tasks/:id/decision` | POST | Submit approval/rejection |
| `/activity` | GET | Audit log entries |
| `/attacks` | GET | Attack events |

## Contributing

1. Follow TypeScript strict mode
2. Use Biome for linting and formatting
3. Keep components small and composable
4. Maintain type definitions in `lib/types.ts`
5. Test authentication flows with demo credentials

## License

Proprietary – Shield Fintech Edition
