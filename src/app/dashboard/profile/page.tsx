import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/dashboard/profile-client";

export const metadata = { title: "Profile – Dashboard" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, phone: true, bio: true, createdAt: true },
  });

  if (!user) redirect("/auth/login");

  return <ProfileClient user={user} />;
}
