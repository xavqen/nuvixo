"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Bookmark, History, Receipt, User, Settings,
  Bell, LogOut, LayoutDashboard, Heart,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const dashNavLinks = [
  { label: "My Notes",        href: "/dashboard/notes",    icon: BookOpen },
  { label: "Reading History", href: "/dashboard/history",  icon: History },
  { label: "Bookmarks",       href: "/dashboard/bookmarks",icon: Bookmark },
  { label: "Wishlist",        href: "/dashboard/wishlist", icon: Heart },
  { label: "Invoices",        href: "/dashboard/invoices", icon: Receipt },
  { label: "Notifications",   href: "/dashboard/notifications", icon: Bell },
  { label: "Profile",         href: "/dashboard/profile",  icon: User },
  { label: "Settings",        href: "/dashboard/settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container flex gap-8 py-8 flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0">
          <div className="rounded-2xl border border-border bg-card p-4 sticky top-24">
            {/* User card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-brand-400 to-violet-500 text-white text-sm font-bold">
                  {getInitials(user.name ?? user.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user.name ?? "Student"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-0.5">
              {dashNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 text-sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="w-4 h-4" />Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
