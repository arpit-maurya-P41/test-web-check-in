import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Profile from "@/components/Profile";
import { isUserAdmin } from "@/app/actions/dashboardActions";


export default async function ProfileManagement({params}: {params: Promise<{ userId: string }>}) {
    const { userId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isAdmin = await isUserAdmin(session.user.id);

  return <Profile userId={userId ?? session.user.id} isAdmin={isAdmin}/>;
}