import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { User } from "@/lib/types";

// Shield Core API URL
const SHIELD_API_URL = process.env.NEXT_PUBLIC_SHIELD_API_URL || "";
const USE_SHIELD_API = !!SHIELD_API_URL;

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
    };
  }

  interface JWT {
    id?: string;
    companyId?: string | null;
    role?: string;
    accessToken?: string;
  }
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
 * Authenticate against Shield Core API
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
} | null> {
  try {
    const response = await fetch(`${SHIELD_API_URL}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error("Shield Core auth failed:", response.status);
      return null;
    }

    const data = await response.json();
    
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.email.split("@")[0], // Derive name from email
      role: data.user.role,
      accessToken: data.token,
    };
  } catch (error) {
    console.error("Shield Core auth error:", error);
    return null;
  }
}

/**
 * Fetch user's companies from Shield Core
 */
async function fetchUserCompanies(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${SHIELD_API_URL}/v1/companies`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Return the first company ID if user has companies
    if (data.companies && data.companies.length > 0) {
      return data.companies[0].id;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return null;
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
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        
        // Check for Shield Core token
        const extendedUser = user as { accessToken?: string; role?: string };
        if (extendedUser.accessToken) {
          const accessToken = extendedUser.accessToken;
          token.accessToken = accessToken;
          token.role = extendedUser.role || "member";
          
          // Fetch companies to get companyId
          const companyId = await fetchUserCompanies(accessToken);
          token.companyId = companyId;
        } else {
          // Mock user flow
          const existingUser = mockUsers[user.id as string];

          if (existingUser) {
            token.companyId = existingUser.companyId;
            token.role = existingUser.role;
          } else {
            // New OAuth user - they need to complete onboarding
            token.companyId = null;
            token.role = "member";

            // Store the new user (in production, save to DB)
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

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string | null;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string | undefined;
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
