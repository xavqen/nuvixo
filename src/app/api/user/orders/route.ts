import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    include: {
      items: {
        include: {
          note: {
            select: {
              id: true, title: true, slug: true, coverUrl: true,
              class: { select: { name: true } },
              subject: { select: { name: true } },
            },
          },
        },
      },
      invoice: { select: { invoiceNumber: true, issuedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
