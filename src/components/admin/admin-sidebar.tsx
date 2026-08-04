"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FolderTree, ShoppingBag, Tag,
  Users, Star, Newspaper, Megaphone, Settings, BarChart3,
  Upload, BookMarked, Shield, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const adminNav = [
  { group: "Overview",  links: [
    { label: "Dashboard",  href: "/admin",               icon: LayoutDashboard },
    { label: "Analytics",  href: "/admin/analytics",     icon: BarChart3 },
  ]},
  { group: "Content",   links: [
    { label: "Notes",      href: "/admin/notes",         icon: BookOpen },
    { label: "Upload PDF", href: "/admin/notes/upload",  icon: Upload },
    { label: "Categories", href: "/admin/categories",    icon: FolderTree },
    { label: "Blog",       href: "/admin/blog",          icon: Newspaper },
  ]},
  { group: "Commerce",  links: [
    { label: "Orders",     href: "/admin/orders",        icon: ShoppingBag },
    { label: "Coupons",    href: "/admin/coupons",       icon: Tag },
  ]},
  { group: "Community", links: [
    { label: "Users",      href: "/admin/users",         icon: Users },
    { label: "Reviews",    href: "/admin/reviews",       icon: Star },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  ]},
  { group: "System",    links: [
    { label: "Settings",   href: "/admin/settings",      icon: Settings },
    { label: "Roles",      href: "/admin/roles",         icon: Shield },
  ]},
];

export function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2 font-heading font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-violet-400 flex items-center justify-center">
            <BookMarked className="w-4 h-4 text-white" />
          </div>
          <span>Studiya Admin</span>
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-brand-600 text-white text-xs font-bold">
              {getInitials(user.name ?? user.email ?? "A")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name ?? "Admin"}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {adminNav.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-3 mb-1.5">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-white/15 text-white font-medium"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors">
          <LayoutDashboard className="w-4 h-4" />View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </aside>
  );
}
