"use server";

import { redirect } from "next/navigation";
import TeamManagementIndex from "@/components/team-management";
import { auth } from "@/auth";
import { isUserAdmin, isUserManager, UserExists } from "../actions/dashboardActions";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    
    const userExists = await UserExists(session.user.id);
    if (!userExists) redirect("/login");

    const isAdmin = await isUserAdmin(session.user.id);
    const isManager = await isUserManager(session.user.id);
    
    if (!isAdmin && !isManager) redirect("/dashboard");

    return <TeamManagementIndex userId={session.user.id} isAdmin={isAdmin} isManager={isManager}/>;
}