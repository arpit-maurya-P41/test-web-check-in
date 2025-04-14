"use server";

import { redirect } from 'next/navigation';
import UserManagementIndex from "@/components/user-management";
import { auth } from "@/auth";
import { getRoles } from "../actions/dashboardActions";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const roles = await getRoles(session.user.id);
    if (!roles.can_manage_users) redirect("/dashboard");

    return <UserManagementIndex userId={session.user.id} roles={roles} />
}