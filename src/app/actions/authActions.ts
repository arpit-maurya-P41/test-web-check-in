"use server";

import { signIn } from "@/auth";

export async function loginUser(email: string, password: string) {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        });
}
