import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function checkNoteAccess(userId: string, noteId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");

  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      items: { some: { noteId } },
    },
  });

  return !!order;
}

export async function hasUserPurchasedNote(userId: string, noteId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");

  const count = await prisma.orderItem.count({
    where: {
      noteId,
      order: { userId, status: "COMPLETED" },
    },
  });

  return count > 0;
}
