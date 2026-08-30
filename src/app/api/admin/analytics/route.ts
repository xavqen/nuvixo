import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalNotes,
    totalOrders,
    completedOrders,
    recentRevenue,
    weeklyRevenue,
    topNotes,
    recentOrders,
    newUsersThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.note.count({ where: { isPublished: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
      _sum: { finalAmount: true },
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: sevenDaysAgo } },
      _sum: { finalAmount: true },
    }),
    prisma.note.findMany({
      where: { isPublished: true },
      orderBy: { purchaseCount: "desc" },
      take: 5,
      select: { id: true, title: true, purchaseCount: true, viewCount: true, price: true, coverUrl: true },
    }),
    prisma.order.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { note: { select: { title: true } } } },
      },
    }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      totalNotes,
      totalOrders,
      completedOrders,
      conversionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      revenueThisMonth: recentRevenue._sum.finalAmount ?? 0,
      revenueThisWeek: weeklyRevenue._sum.finalAmount ?? 0,
      newUsersThisMonth,
    },
    topNotes,
    recentOrders,
  });
}
