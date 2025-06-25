import NextAuth from "next-auth";
import { prisma } from "@/prisma";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import type { Adapter } from "@auth/core/adapters";

const customAdapter = (): Adapter => {
  return {
    async getUserByEmail(email) {
      const user = await prisma.users.findUnique({
        where: { email },
      });
      if (!user) return null;
      return {
        id: String(user.id),
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        emailVerified: null,
      };
    },
    async getUser(id) {
      const user = await prisma.users.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user) return null;
      return {
        id: String(user.id),
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        emailVerified: null,
      };
    },
    async createSession({ sessionToken, userId, expires }) {
      await prisma.sessions.create({
        data: {
          user_id: parseInt(userId),
          expires_at: expires,
        },
      });
      return {
        sessionToken,
        userId,
        expires,
      };
    },
    
    async createUser() {
      throw new Error("User creation is not allowed through the authentication flow");
    },
    async getUserByAccount() { return null; },
    async updateUser() { throw new Error("Not implemented"); },
    async linkAccount() { return; },
    async getSessionAndUser() { return null; },
    async updateSession() { return null; },
    async deleteSession() { return; },
    async createVerificationToken() { return null; },
    async useVerificationToken() { return null; },
  };
};

export const authConfig: NextAuthConfig = {
    adapter: customAdapter(),
    pages: {
        signIn: "/login",
        error: "/access-denied",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        authorized({ request: { nextUrl }, auth }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            if (pathname.startsWith("/login") && isLoggedIn) {
                return Response.redirect(new URL("/", nextUrl));
            }

            // Allow access to the access-denied page without authentication
            if (pathname.startsWith("/access-denied")) {
                return true;
            }

            return !!auth;
        },
        async signIn({ user, account, profile: _profile }) { // eslint-disable-line @typescript-eslint/no-unused-vars
            if (account?.provider === "google" && user.email) {
                // Check if user exists with this email
                const dbUser = await prisma.users.findUnique({
                    where: { email: user.email }
                });
                
                if (!dbUser) {
                    // User doesn't exist in our database
                    console.error("Access denied: User does not exist in the system");
                    throw new Error("AccessDenied");
                }
                
                // Check if user is active
                if (!dbUser.is_active) {
                    console.error("User account is not active");
                    throw new Error("AccountInactive");
                }
                
                // Check if user has admin access
                if (dbUser.is_admin) {
                    user.id = String(dbUser.id);
                    return true;
                }
                
                // Check if user has any roles assigned
                const userRoles = await prisma.user_team_role.findFirst({
                    where: { user_id: dbUser.id }
                });
                
                if (!userRoles) {
                    console.error("User does not have any assigned roles");
                    throw new Error("NoRolesAssigned");
                }
                
                // Allow sign in with this Google account
                user.id = String(dbUser.id);
                return true;
            }
            
            throw new Error("AccessDenied");
        },
        jwt({ token, user, account: _account }) { // eslint-disable-line @typescript-eslint/no-unused-vars
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                },
            };
        },
    },
    session: { strategy: "jwt" },
    debug: process.env.NODE_ENV === "development",
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
