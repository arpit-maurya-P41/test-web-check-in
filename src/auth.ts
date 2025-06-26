import NextAuth from "next-auth";
import { prisma } from "@/prisma";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";


export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
        error: "/access-denied",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        authorized({ request: { nextUrl }, auth }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            if (pathname.startsWith("/login") && isLoggedIn) {
                return Response.redirect(new URL("/", nextUrl));
            }

            if (pathname.startsWith("/access-denied")) {
                return true;
            }

            return !!auth;
        },
        async signIn({ user, account}) {
            if (account?.provider === "google" && user.email) {
                const dbUser = await prisma.users.findUnique({
                    where: { email: user.email }
                });
                
                if (!dbUser) {
                    return "/access-denied?error=AccessDenied";
                }
                
                if (dbUser && !dbUser.is_active) {
                    return "/access-denied?error=AccountInactive";
                }
                
                user.id = String(dbUser.id);
                return true;
            }
            
            return "/access-denied?error=AccessDenied";
        },
        jwt({ token, user }) {
            if (user) {
              return { ...token, id: user.id }
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
