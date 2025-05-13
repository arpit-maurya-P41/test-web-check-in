"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRoles } from "../actions/dashboardActions";
import Profile from "@/components/Profile";

export default async function ProfileManagement() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const roles = await getRoles(session.user.id);
    if (!roles.can_manage_teams) redirect("/dashboard");

    return <Profile  userId={session.user.id} roles={roles} />;
}