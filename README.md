# Shield Console

> Control plane and monitoring UI for **Shield – Fintech Edition**, an AI Safety Gateway for financial services.

![Shield Console](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan)

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
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4
- **Linting**: Biome

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx            # Sidebar + Topbar shell
│   │   ├── overview/             # Global dashboard with KPIs & charts
│   │   ├── applications/         # Applications list + [id] detail
│   │   ├── hitl/                 # HITL Queue with review workflow
│   │   ├── activity/             # Activity Log (audit trail)
│   │   └── settings/             # Organization & policy settings
│   ├── globals.css               # Fintech theme + CSS variables
│   └── layout.tsx                # Root layout
├── components/
│   ├── charts/                   # AreaChart, BarChart, RiskPieChart
│   ├── common/                   # KpiCard, Badge, ApplicationFilter
│   ├── drawers/                  # ActionDetailDrawer, HitlDetailDrawer
│   ├── layout/                   # Sidebar, Topbar
│   └── tables/                   # ActionsTable
└── lib/
    ├── types.ts                  # TypeScript domain models
    ├── mockData.ts               # Realistic fintech mock data
    ├── api.ts                    # Data fetching layer
    └── hooks/                    # React hooks (useGlobalFilters)
```

## Pages

### Overview (`/overview`)
Global dashboard showing:
- KPIs: Total Actions, Blocked, HITL, Attacks, ASR, Users Impacted
- Charts: Actions over time (stacked area), Attacks by application (bar)
- Risk distribution pie chart
- Shield performance metrics
- Recent activity table

### Applications (`/applications`)
- Grid of application cards with status, environment, and metrics
- Detail view (`/applications/[id]`) with app-specific KPIs, attack history, action breakdown

### HITL Queue (`/hitl`)
- Filterable task list (application, status, risk, search)
- Status tabs: All, Pending, Approved, Rejected
- Detail drawer with Approve/Reject workflow
- Review notes and audit trail

### Activity Log (`/activity`)
- Full audit history of Shield decisions
- Advanced filters (application, decision, risk, search)
- Export capability (placeholder)

### Settings (`/settings`)
- Organization configuration
- API keys management
- Policy thresholds display
- Notification preferences

## Domain Models

```typescript
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

## Connecting to Shield Core

The `lib/api.ts` file contains data fetching functions that currently return mock data. To connect to the real `shield-core` backend:

```typescript
// lib/api.ts

// Set the base URL via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_SHIELD_API_URL || "/api";

// Replace mock implementations with real fetch calls
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

## Environment Variables

Create a `.env.local` file:

```bash
# Shield Core API URL (optional, defaults to /api for local dev)
NEXT_PUBLIC_SHIELD_API_URL=http://localhost:8080

# Future: Auth configuration
# NEXT_PUBLIC_AUTH_URL=
# NEXTAUTH_SECRET=
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run Biome linter
npm run format    # Format code with Biome
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

### Components

- **KpiCard**: Metric display with icon, variant, and optional trend
- **Badge**: Status indicators (RiskBadge, DecisionBadge, StatusBadge)
- **ActionsTable**: Sortable table with row click for details
- **Drawers**: Slide-in panels for action/task details

## Contributing

1. Follow TypeScript strict mode
2. Use Biome for linting and formatting
3. Keep components small and composable
4. Maintain type definitions in `lib/types.ts`

## License

Proprietary – Shield Fintech Edition
