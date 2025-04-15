"use server";

import { redirect } from "next/navigation";
import TeamManagementIndex from "@/components/team-management";
import { auth } from "@/auth";
import { getRoles } from "../actions/dashboardActions";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const roles = await getRoles(session.user.id);
    if (!roles.can_manage_teams) redirect("/dashboard");

    return <TeamManagementIndex userId={session.user.id} roles={roles} />
}