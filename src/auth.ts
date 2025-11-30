import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { User } from "@/lib/types";

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
    };
  }
}

// Mock user database for development
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
    // Credentials provider for demo/development
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

        // Find user by email (mock implementation)
        const user = Object.values(mockUsers).find(
          (u) => u.email === credentials.email
        );

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;

        // Check if user exists in our "database"
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

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string | null;
        session.user.role = token.role as string;
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

