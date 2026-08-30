import { auth } from "@/auth";
import { redirect } from "next/navigation";
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) redirect("/dashboard");
  return session;
}
