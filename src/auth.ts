import NextAuth from "next-auth";
import { prisma } from "@/prisma";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import type { Adapter } from "@auth/core/adapters";

const customAdapter = (): Adapter => {
  return {
    async createUser(user) {
      const newUser = await prisma.users.create({
        data: {
          email: user.email,
          first_name: user.name?.split(" ")[0] || "",
          last_name: user.name?.split(" ")[1] || "",
          is_active: true
        },
      });
      return {
        id: String(newUser.id),
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`.trim(),
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
    async getUserByAccount() {
      return null;
    },
    async updateUser(user) {
      const updated = await prisma.users.update({
        where: { id: parseInt(user.id) },
        data: {
          email: user.email,
          first_name: user.name?.split(" ")[0] || "",
          last_name: user.name?.split(" ")[1] || "",
        },
      });
      return {
        id: String(updated.id),
        email: updated.email,
        name: `${updated.first_name} ${updated.last_name}`.trim(),
        emailVerified: null,
      };
    },
    async linkAccount() {
      // Since we don't have an accounts table, we'll just return
      return;
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
    async getSessionAndUser() {
      return null;
    },
    async updateSession() {
      return null;
    },
    async deleteSession() {
      // Simplified implementation
      return;
    },
    async createVerificationToken() {
      // Simplified implementation
      return null;
    },
    async useVerificationToken() {
      // Simplified implementation
      return null;
    },
  };
};

export const authConfig: NextAuthConfig = {
    adapter: customAdapter(),
    pages: {
        signIn: "/login",
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

            return !!auth;
        },
        async signIn({ user, account, profile: _profile }) { // eslint-disable-line @typescript-eslint/no-unused-vars
            if (account?.provider === "google" && user.email) {
                // Check if user exists with this email
                let dbUser = await prisma.users.findUnique({
                    where: { email: user.email }
                });
                
                if (!dbUser) {
                    // Create a new user if one doesn't exist
                    try {
                        dbUser = await prisma.users.create({
                            data: {
                                email: user.email,
                                first_name: user.name?.split(" ")[0] || "",
                                last_name: user.name?.split(" ")[1] || "",
                                is_active: true
                            }
                        });
                    } catch (error) {
                        console.error("Error creating user:", error);
                        return false;
                    }
                }
                
                // Allow sign in with this Google account
                user.id = String(dbUser.id);
                return true;
            }
            
            return true;
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
