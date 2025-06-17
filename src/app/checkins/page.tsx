"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRoles, getTeams } from "../actions/dashboardActions";
import Checkins from "@/components/Checkins";

export default async function Checkin() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const [roles, teams] = await Promise.all([
        getRoles(session.user.id),
        getTeams(session.user.id)
    ]);
    
    return <Checkins  userId={session.user.id} roles={roles} teams={teams} />;
}