import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRoles } from "@/app/actions/dashboardActions";
import Profile from "@/components/Profile";


export default async function ProfileManagement({params}: {params: Promise<{ userId: string }>}) {
    const { userId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const roles = await getRoles(session.user.id);
  if (!roles?.can_manage_teams) redirect("/dashboard");

  return <Profile userId={userId ?? session.user.id} roles={roles} />;
}