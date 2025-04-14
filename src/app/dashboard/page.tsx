"use server";

import { redirect } from 'next/navigation';
import Dashboard from "@/components/Dashboard";
import { auth } from "@/auth";
import { getRoles } from "../actions/dashboardActions";

export default async function Administrator() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const roles = await getRoles(session.user.id);

    return <Dashboard userId={session.user.id} roles={roles} />
}