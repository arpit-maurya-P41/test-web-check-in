"use server";

import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { auth } from "@/auth";
import { getTeams, getTeamUsers, isUserAdmin } from "../actions/dashboardActions";

export default async function Administrator() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const [teams] = await Promise.all([
        getTeams(session.user.id)
    ]);

    const users = await getTeamUsers(teams[0]?.id ?? 0);

    const isAdmin = await isUserAdmin(session.user.id);

    return <Dashboard userId={session.user.id} users={users} teams={teams} isAdmin={isAdmin}/>
}