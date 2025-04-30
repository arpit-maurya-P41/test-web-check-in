"use server";

import { signIn, signOut } from "@/auth";

export async function loginUser(email: string, password: string) {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        });
}

export async function logoutUser() {
    await signOut({
        redirectTo: "/login",
    });
}
