import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
    redirect("/dashboard/notes");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar user={session.user} />
      <main className="flex-1 ml-64 p-8 min-w-0">{children}</main>
    </div>
  );
}
