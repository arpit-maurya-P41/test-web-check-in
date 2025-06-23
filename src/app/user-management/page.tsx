"use server";

import { redirect } from "next/navigation";
import UserManagementIndex from "@/components/user-management";
import { auth } from "@/auth";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    
    return <UserManagementIndex userId={session.user.id} />
}