"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TeamProfile from "@/components/team-management/teamProfile";
import { isUserAdmin, isUserManager, hasTeamPermission, UserExists } from "@/app/actions/dashboardActions";

export default async function TeamProfileManagement({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userExists = await UserExists(session.user.id);
    if (!userExists) redirect("/login");

  const isAdmin = await isUserAdmin(session.user.id);
  const isManager = await isUserManager(session.user.id);
  
  // Check if user has permission to access this team
  const hasPermission = isAdmin || await hasTeamPermission(session.user.id, parseInt(teamId), 'manager');
  
  if (!hasPermission) redirect("/dashboard");

  return <TeamProfile userId={session.user.id} teamId={teamId} isAdmin={isAdmin} isManager={isManager}/>;
}
