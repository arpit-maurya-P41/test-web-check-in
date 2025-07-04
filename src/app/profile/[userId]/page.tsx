import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Profile from "@/components/Profile";
import { isUserAdmin, isUserManager, UserExists } from "@/app/actions/dashboardActions";

export default async function ProfileManagement({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const loggedInUserId = session.user.id;
  const loggedInUserExists = await UserExists(loggedInUserId);

  if (!loggedInUserExists) {
    redirect("/login");
  }
  const isAdmin = await isUserAdmin(loggedInUserId);
  const isManager = await isUserManager(loggedInUserId);
  const userExists = await UserExists(userId);
  
  if (!userExists || (!isAdmin && userId !== loggedInUserId)) {
    redirect(`/profile/${loggedInUserId}`)
  }

  return <Profile userId={userId ?? loggedInUserId} isAdmin={isAdmin} isManager={isManager} />;
}
