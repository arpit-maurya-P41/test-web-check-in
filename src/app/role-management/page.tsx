"use server";

import { redirect } from "next/navigation";
import RoleManagementIndex from "@/components/role-management";
import { auth } from "@/auth";
import { getRoles } from "../actions/dashboardActions";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const roles = await getRoles(session.user.id);
    if (!roles.can_manage_roles) redirect("/dashboard");

    return <RoleManagementIndex userId={session.user.id} roles={roles} />;
}