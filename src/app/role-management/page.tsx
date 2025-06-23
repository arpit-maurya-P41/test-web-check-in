"use server";

import { redirect } from "next/navigation";
import RoleManagementIndex from "@/components/role-management";
import { auth } from "@/auth";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    return <RoleManagementIndex userId={session.user.id} />;
}