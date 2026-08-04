import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ShoppingBag, Users, ArrowUpRight, DollarSign, Eye } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard – Nuvixo" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalNotes, completedOrders, revenue, recentOrders, topNotes] = await Promise.all([
    prisma.user.count(),
    prisma.note.count({ where: { isPublished: true } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { finalAmount: true } }),
    prisma.order.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { note: { select: { title: true } } } },
      },
    }),
    prisma.note.findMany({
      where: { isPublished: true },
      orderBy: { purchaseCount: "desc" },
      take: 5,
      select: { id: true, title: true, purchaseCount: true, viewCount: true, price: true, slug: true },
    }),
  ]);

  const stats = [
    { label: "Total Users",   value: totalUsers.toLocaleString("en-IN"),   icon: Users,        color: "bg-blue-500" },
    { label: "Published Notes",value: totalNotes.toLocaleString("en-IN"),  icon: BookOpen,     color: "bg-violet-500" },
    { label: "Total Orders",   value: completedOrders.toLocaleString("en-IN"), icon: ShoppingBag, color: "bg-amber-500" },
    { label: "Total Revenue",  value: formatPrice(revenue._sum.finalAmount ?? 0), icon: DollarSign, color: "bg-green-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link href="/admin/notes/upload" className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          + Upload Notes
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {(order.user.name ?? order.user.email ?? "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{order.user.name ?? order.user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.items.map((i) => i.note.title).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, { month: "short", day: "numeric" })}</p>
                </div>
                <span className="font-semibold text-sm flex-shrink-0">{formatPrice(order.finalAmount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Notes */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Top Notes</h2>
            <Link href="/admin/notes" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {topNotes.map((note, idx) => (
              <div key={note.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/notes/${note.id}/edit`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
                    {note.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{note.purchaseCount}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{note.viewCount}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatPrice(note.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
