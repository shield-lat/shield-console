import type { User } from "@/lib/types";
import type { Account } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// Shield Core API URL - normalize to base URL without /v1
// Try multiple environment variable names for flexibility
function getShieldApiBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SHIELD_API_URL || process.env.SHIELD_API_URL || "";
  if (!envUrl) return "";
  // Remove trailing slash and /v1 suffix if present
  return envUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

const SHIELD_API_BASE = getShieldApiBaseUrl();
const USE_SHIELD_API = !!SHIELD_API_BASE;

// Always log the configured URL to help debug production issues
console.log("[Shield Auth] API Base URL:", SHIELD_API_BASE || "(not set)");
console.log("[Shield Auth] USE_SHIELD_API:", USE_SHIELD_API);

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      companyId: string | null;
      role: string;
      accessToken?: string; // Shield Core JWT token
      companies?: Array<{
        id: string;
        name: string;
        slug: string;
        role: string;
      }>;
    };
  }

  interface JWT {
    id?: string;
    companyId?: string | null;
    role?: string;
    accessToken?: string;
    companies?: Array<{ id: string; name: string; slug: string; role: string }>;
  }
}

// Response types from Shield Core API
interface ShieldCoreUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: string;
  email_verified: boolean;
  created_at: string;
}

interface ShieldCoreCompany {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface OAuthSyncResponse {
  user: ShieldCoreUser;
  token: string;
  expires_in: number;
  is_new_user: boolean;
  companies: ShieldCoreCompany[];
}

interface LoginResponse {
  user: ShieldCoreUser;
  token: string;
  expires_in: number;
  companies: ShieldCoreCompany[];
}

// Mock user database for development (used when SHIELD_API_URL is not set)
const mockUsers: Record<string, User & { password?: string }> = {
  "user-demo": {
    id: "user-demo",
    email: "demo@shield.lat",
    name: "Demo User",
    image: null,
    emailVerified: new Date(),
    companyId: "company-acme",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: "demo123",
  },
};

/**
 * Sync OAuth user with Shield Core API
 * Called when a user signs in via Google or GitHub
 */
async function syncOAuthUserWithShieldCore(
  provider: string,
  providerAccountId: string,
  email: string,
  name: string | null,
  image: string | null
): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: string;
  accessToken: string;
  companies: ShieldCoreCompany[];
  isNewUser: boolean;
} | null> {
  try {
    // Map NextAuth provider names to Shield Core provider names
    const providerMap: Record<string, string> = {
      google: "google",
      github: "git_hub", // Shield Core uses git_hub (snake_case)
    };

    console.log(
      "[Shield OAuth Sync] Calling:",
      `${SHIELD_API_BASE}/v1/auth/oauth/sync`
    );
    const response = await fetch(`${SHIELD_API_BASE}/v1/auth/oauth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: providerMap[provider] || provider,
        provider_id: providerAccountId,
        email,
        name,
        image,
        email_verified: true, // OAuth providers verify emails
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Shield OAuth Sync] Failed:", response.status, errorText);
      return null;
    }

    const data: OAuthSyncResponse = await response.json();
    console.log("[Shield OAuth Sync] Success:", {
      userId: data.user.id,
      isNewUser: data.is_new_user,
      companiesCount: data.companies.length,
    });

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      accessToken: data.token,
      companies: data.companies,
      isNewUser: data.is_new_user,
    };
  } catch (error) {
    console.error("[Shield OAuth Sync] Error:", error);
    return null;
  }
}

/**
 * Authenticate against Shield Core API (email/password)
 */
async function authenticateWithShieldCore(
  email: string,
  password: string
): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: string;
  accessToken: string;
  companies: ShieldCoreCompany[];
} | null> {
  try {
    const response = await fetch(`${SHIELD_API_BASE}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error("[Shield Login] Failed:", response.status);
      return null;
    }

    const data: LoginResponse = await response.json();

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || email.split("@")[0],
      role: data.user.role,
      accessToken: data.token,
      companies: data.companies,
    };
  } catch (error) {
    console.error("[Shield Login] Error:", error);
    return null;
  }
}

/**
 * Fetch user's companies from Shield Core (fallback)
 */
async function fetchUserCompanies(
  accessToken: string
): Promise<ShieldCoreCompany[]> {
  try {
    const response = await fetch(`${SHIELD_API_BASE}/v1/companies`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.companies || [];
  } catch (error) {
    console.error("[Shield] Failed to fetch companies:", error);
    return [];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials provider - uses Shield Core API when available
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Try Shield Core API first
        if (USE_SHIELD_API) {
          const shieldUser = await authenticateWithShieldCore(email, password);
          if (shieldUser) {
            return {
              id: shieldUser.id,
              email: shieldUser.email,
              name: shieldUser.name,
              image: null,
              role: shieldUser.role,
              accessToken: shieldUser.accessToken,
              companies: shieldUser.companies,
            } as any; // Extended user object
          }
        }

        // Fallback to mock users for demo
        const mockUser = Object.values(mockUsers).find(
          (u) => u.email === email
        );

        if (!mockUser || mockUser.password !== password) {
          return null;
        }

        return {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          image: mockUser.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.id = user.id;

        // OAuth sign in (Google, GitHub)
        if (account.provider === "google" || account.provider === "github") {
          if (USE_SHIELD_API) {
            // Sync OAuth user with Shield Core
            const shieldUser = await syncOAuthUserWithShieldCore(
              account.provider,
              account.providerAccountId!,
              user.email!,
              user.name || null,
              user.image || null
            );

            if (shieldUser) {
              token.id = shieldUser.id;
              token.accessToken = shieldUser.accessToken;
              token.role = shieldUser.role;
              token.companies = shieldUser.companies;
              token.companyId =
                shieldUser.companies.length > 0
                  ? shieldUser.companies[0].id
                  : null;

              console.log("[Shield Auth] OAuth user synced successfully:", {
                id: shieldUser.id,
                hasAccessToken: !!shieldUser.accessToken,
                companiesCount: shieldUser.companies.length,
                isNewUser: shieldUser.isNewUser,
              });
            } else {
              // Shield Core sync failed - allow login but no Shield features
              console.error("[Shield Auth] OAuth sync failed!");
              console.error(
                "[Shield Auth] Check Shield Core logs at:",
                SHIELD_API_BASE
              );
              console.error(
                "[Shield Auth] User will have limited functionality without access token"
              );
              token.companyId = null;
              token.role = "member";
              token.companies = [];
              // accessToken remains undefined - this is the problem!
            }
          } else {
            // No Shield API - use mock flow
            const existingUser = mockUsers[user.id as string];
            if (existingUser) {
              token.companyId = existingUser.companyId;
              token.role = existingUser.role;
            } else {
              // New OAuth user in mock mode
              token.companyId = null;
              token.role = "member";
              mockUsers[user.id as string] = {
                id: user.id as string,
                email: user.email as string,
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(),
                companyId: null,
                role: "member",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }
          }
        }
        // Credentials sign in
        else if (account.provider === "credentials") {
          const extendedUser = user as {
            accessToken?: string;
            role?: string;
            companies?: ShieldCoreCompany[];
          };

          if (extendedUser.accessToken) {
            token.accessToken = extendedUser.accessToken;
            token.role = extendedUser.role || "member";
            token.companies = extendedUser.companies || [];
            token.companyId =
              extendedUser.companies && extendedUser.companies.length > 0
                ? extendedUser.companies[0].id
                : null;
          } else {
            // Mock user flow
            const existingUser = mockUsers[user.id as string];
            if (existingUser) {
              token.companyId = existingUser.companyId;
              token.role = existingUser.role;
            } else {
              token.companyId = null;
              token.role = "member";
            }
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string | null;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string | undefined;
        session.user.companies = token.companies as
          | Array<{ id: string; name: string; slug: string; role: string }>
          | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If signing in and no company, redirect to onboarding
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
