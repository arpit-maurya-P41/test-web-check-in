"use server";

import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { auth } from "@/auth";
import { getRoles, getTeams, getTeamUsers } from "../actions/dashboardActions";

export default async function Administrator() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const [roles, teams] = await Promise.all([
        getRoles(session.user.id),
        getTeams(session.user.id)
    ]);

    const users = await getTeamUsers(teams[0]?.id ?? 0);

    return <Dashboard userId={session.user.id} roles={roles} users={users} teams={teams}/>
}