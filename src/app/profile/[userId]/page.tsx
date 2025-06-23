import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Profile from "@/components/Profile";


export default async function ProfileManagement({params}: {params: Promise<{ userId: string }>}) {
    const { userId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <Profile userId={userId ?? session.user.id} />;
}