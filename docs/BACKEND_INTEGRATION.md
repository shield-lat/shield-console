# Shield Console ↔ Shield Core Backend Integration

## Overview

The Shield Console frontend uses **NextAuth.js v5** for authentication. The backend has implemented the required endpoints for OAuth integration.

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              OAuth Authentication Flow                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  User clicks "Sign in with Google/GitHub"                                         │
│                      │                                                            │
│                      ▼                                                            │
│  NextAuth handles OAuth flow with provider                                        │
│                      │                                                            │
│                      ▼                                                            │
│  Frontend calls: POST /v1/auth/oauth/sync                                         │
│  Body: {                                                                          │
│    "provider": "google" | "git_hub",                                              │
│    "provider_id": "oauth-provider-user-id",                                       │
│    "email": "user@example.com",                                                   │
│    "name": "John Doe",                                                            │
│    "image": "https://...",                                                        │
│    "email_verified": true                                                         │
│  }                                                                                │
│                      │                                                            │
│                      ▼                                                            │
│  Backend creates/syncs user and returns:                                          │
│  {                                                                                │
│    "user": { "id", "email", "name", "role", "email_verified", "created_at" },    │
│    "token": "shield-core-jwt-token",                                              │
│    "expires_in": 86400,                                                           │
│    "is_new_user": true/false,                                                     │
│    "companies": [{ "id", "name", "slug", "role" }]                               │
│  }                                                                                │
│                      │                                                            │
│                      ▼                                                            │
│  Frontend stores token in NextAuth JWT session                                    │
│  Token used for all subsequent Shield Core API calls                              │
│                      │                                                            │
│                      ▼                                                            │
│  If is_new_user && no companies → redirect to /onboarding                         │
│  If has companies → redirect to /{company-slug}/overview                          │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Required Backend Endpoints

### 1. OAuth User Sync ✅ Implemented

```http
POST /v1/auth/oauth/sync
Content-Type: application/json

{
  "provider": "google",           // "google" | "git_hub"
  "provider_id": "123456789",     // OAuth provider's user ID
  "email": "user@example.com",
  "name": "John Doe",             // nullable
  "image": "https://...",         // nullable
  "email_verified": true
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "member",
    "email_verified": true,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400,
  "is_new_user": true,
  "companies": []
}
```

### 2. Email/Password Login ✅ Implemented

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400,
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Inc",
      "slug": "acme-inc",
      "role": "owner"
    }
  ]
}
```

### 3. Get Current User ✅ Implemented

```http
GET /v1/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "member",
    "email_verified": true,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Inc",
      "slug": "acme-inc",
      "role": "owner"
    }
  ]
}
```

### 4. Token Refresh ✅ Implemented

```http
POST /v1/auth/token/refresh
Authorization: Bearer <expiring-token>
```

**Response:**
```json
{
  "token": "new-jwt-token",
  "expires_in": 86400
}
```

### 5. List Companies ✅ Implemented

```http
GET /v1/companies
Authorization: Bearer <token>
```

**Response:**
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Inc",
      "slug": "acme-inc",
      "description": null,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 6. Create Company ✅ Implemented

```http
POST /v1/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Company",
  "description": "Optional description"
}
```

**Response (201):**
```json
{
  "company": {
    "id": "uuid",
    "name": "New Company",
    "slug": "new-company",
    "description": "Optional description",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

## Frontend Configuration

### Environment Variables

```env
# Shield Core API URL
NEXT_PUBLIC_SHIELD_API_URL=http://localhost:8080

# NextAuth Configuration
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Provider ID Mapping

| NextAuth Provider | Shield Core Provider |
|-------------------|----------------------|
| `google`          | `google`             |
| `github`          | `git_hub`            |

## JWT Token Usage

The Shield Core JWT token is stored in the NextAuth session and passed to all API calls:

```typescript
// Frontend API calls include the token
const response = await fetch(`${SHIELD_API_URL}/v1/companies/${companyId}/apps`, {
  headers: {
    Authorization: `Bearer ${session.user.accessToken}`,
  },
});
```

## Session Structure

```typescript
interface Session {
  user: {
    id: string;              // Shield Core user ID
    email: string;
    name: string | null;
    image: string | null;
    companyId: string | null;  // First company ID (for routing)
    role: string;              // "member" | "admin"
    accessToken?: string;      // Shield Core JWT
    companies?: Array<{        // All user companies
      id: string;
      name: string;
      slug: string;
      role: string;
    }>;
  };
}
```

## Testing Checklist

- [ ] New user signs in with Google → user created in Shield Core
- [ ] Existing user signs in with Google → user returned with token
- [ ] OAuth sync returns `is_new_user: true` for new users
- [ ] Companies array is populated for returning users
- [ ] Token works for authenticated endpoints
- [ ] Company creation works and appears in subsequent calls
- [ ] Token refresh works before expiration

