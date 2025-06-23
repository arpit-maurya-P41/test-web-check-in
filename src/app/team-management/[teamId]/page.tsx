"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TeamProfile from "@/components/team-management/teamProfile";
import { isUserAdmin } from "@/app/actions/dashboardActions";

export default async function TeamProfileManagement({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isAdmin = await isUserAdmin(session.user.id);
  if (!isAdmin) redirect("/dashboard");

  return <TeamProfile userId={session.user.id} teamId={teamId} isAdmin={isAdmin}/>;
}
