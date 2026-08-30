import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/dashboard/notes");

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
}
