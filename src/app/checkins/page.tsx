"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTeams } from "../actions/dashboardActions";
import Checkins from "@/components/Checkins";

export default async function Checkin() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const [teams] = await Promise.all([
        getTeams(session.user.id)
    ]);
    
    return <Checkins  userId={session.user.id} teams={teams} />;
}