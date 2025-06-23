"use server";

import { redirect } from "next/navigation";
import TeamManagementIndex from "@/components/team-management";
import { auth } from "@/auth";

export default async function TeamManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    return <TeamManagementIndex userId={session.user.id} />
}