"use server";

import { redirect } from "next/navigation";
import TeamManagementIndex from "@/components/team-management";
import { auth } from "@/auth";
import { isUserAdmin, UserExists } from "../actions/dashboardActions";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    
    const userExists = await UserExists(session.user.id);
    if (!userExists) redirect("/login");

    const isAdmin = await isUserAdmin(session.user.id);
    if (!isAdmin) redirect("/dashboard");

    return <TeamManagementIndex userId={session.user.id} isAdmin={isAdmin}/>
}