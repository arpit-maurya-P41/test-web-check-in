"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTeams, isUserAdmin, isUserManager, UserExists } from "../actions/dashboardActions";
import Checkins from "@/components/Checkins";
import { prisma } from "@/prisma";

export default async function Checkin() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    const userExists = await UserExists(session.user.id);
    if (!userExists) redirect("/login");
    
    const isAdmin = await isUserAdmin(session.user.id);
    const isManager = await isUserManager(session.user.id);
    
    // For admins, get all teams; for regular users, get only their teams
    let teams;
    if (isAdmin) {
        teams = await prisma.teams.findMany({
            where: { is_active: true },
            orderBy: { name: "asc" }
        });
    } else {
        teams = await getTeams(session.user.id);
    }
    
    return <Checkins userId={session.user.id} teams={teams} isAdmin={isAdmin} isManager={isManager}/>;
}