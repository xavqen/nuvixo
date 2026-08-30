import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
export function AdminPage({ user, title, description, action, children }: { user: any; title: string; description: string; action?: ReactNode; children: ReactNode }) {
 return <div className="min-h-screen bg-muted/30"><AdminSidebar user={user}/><main className="ml-64 p-8"><div className="mb-8 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">{title}</h1><p className="mt-1 text-muted-foreground">{description}</p></div>{action}</div>{children}</main></div>
}
