"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTeams, isUserAdmin, isUserManager, UserExists } from "../actions/dashboardActions";
import Checkins from "@/components/Checkins";

export default async function Checkin() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    const userExists = await UserExists(session.user.id);
    if (!userExists) redirect("/login");
    const [teams] = await Promise.all([
        getTeams(session.user.id)
    ]);

    const isAdmin = await isUserAdmin(session.user.id);
    const isManager = await isUserManager(session.user.id);
    
    return <Checkins userId={session.user.id} teams={teams} isAdmin={isAdmin} isManager={isManager}/>;
}