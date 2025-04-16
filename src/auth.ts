import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "Please enter an email",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Please enter an password",
                },
            },
            authorize: async (credentials) => {
                const user = await prisma.users.findFirst({
                    where: {
                        email: credentials?.email as string,
                    },
                });

                if (user && credentials?.password === user?.password) {
                    return {
                        ...user,
                        id: user.id.toString(), // Convert id to string
                    };
                }

                return null; // if credentials are invalid
            },
        }),
    ],
    callbacks: {
        authorized({ request: { nextUrl }, auth }) {
            console.log("auth", auth);

            const isLoggedIn = !!auth?.user;

            const { pathname } = nextUrl;

            console.log("isLoggedIn", isLoggedIn);

            if (pathname.startsWith("/login") && isLoggedIn) {
                return Response.redirect(new URL("/", nextUrl));
            }

            return !!auth;
        },
        jwt({ token, user }) {
            if (user) {
                return { ...token, id: user.id };
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
    session: { strategy: "jwt", maxAge: 60 },
});
