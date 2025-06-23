"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TeamProfile from "@/components/team-management/teamProfile";

export default async function TeamProfileManagement({params}: {params: Promise<{ teamId: string }>}) {
    const { teamId } = await params;

    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    return <TeamProfile userId={session.user.id} teamId={teamId} />
}