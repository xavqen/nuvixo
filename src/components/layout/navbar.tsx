"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Sun, Moon, Search, BookOpen, ShoppingCart,
  User, Bell, ChevronDown, LogOut, Settings, BookMarked, History,
  LayoutDashboard, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchModal } from "@/components/search/search-modal";
import { cn, getInitials } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home",     href: "/"         },
  { label: "Classes",  href: "/classes"  },
  { label: "Subjects", href: "/subjects" },
  { label: "Notes",    href: "/notes"    },
  { label: "Pricing",  href: "/pricing"  },
  { label: "Blog",     href: "/blog"     },
  { label: "About",    href: "/about"    },
  { label: "Contact",  href: "/contact"  },
];

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="gradient-text">Nuvixo</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </Button>

            {session?.user ? (
              <>
                <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                  <Link href="/dashboard/wishlist" aria-label="Wishlist">
                    <BookMarked className="w-4 h-4" />
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 pl-1 pr-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={session.user.image ?? undefined} />
                        <AvatarFallback className="text-xs bg-brand-100 text-brand-700">
                          {getInitials(session.user.name ?? session.user.email ?? "U")}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{session.user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/notes"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/history"><History className="w-4 h-4 mr-2" />Reading History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile"><User className="w-4 h-4 mr-2" />Profile</Link>
                    </DropdownMenuItem>
                    {["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin"><Shield className="w-4 h-4 mr-2" />Admin Panel</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:opacity-90">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="container py-4 flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-muted-foreground"
                  onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
                >
                  <Search className="w-4 h-4" />Search notes...
                </Button>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!session?.user && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-brand-600 to-violet-600 text-white" asChild>
                      <Link href="/auth/register">Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
