import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { apiRateLimiter } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  noteIds: z.array(z.string()).min(1).max(20),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 422 });

  const { noteIds, couponCode } = parsed.data;

  // Fetch notes
  const notes = await prisma.note.findMany({
    where: { id: { in: noteIds }, isPublished: true },
    select: { id: true, title: true, price: true, isFree: true },
  });

  if (notes.length !== noteIds.length) {
    return NextResponse.json({ error: "One or more notes not found." }, { status: 404 });
  }

  // Check already purchased
  const alreadyPurchased = await prisma.orderItem.findFirst({
    where: {
      noteId: { in: noteIds },
      order: { userId: session.user.id, status: "COMPLETED" },
    },
  });
  if (alreadyPurchased) {
    return NextResponse.json({ error: "You already own one or more of these notes." }, { status: 409 });
  }

  let totalAmount = notes.reduce((sum, n) => sum + (n.isFree ? 0 : n.price), 0);
  let couponDiscount = 0;
  let couponId: string | null = null;

  // Apply coupon
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase(), isActive: true },
    });
    if (!coupon) return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) {
      return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
    }
    if (totalAmount < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order ₹${coupon.minOrderAmount} required.` }, { status: 400 });
    }
    couponDiscount =
      coupon.discountType === "PERCENTAGE"
        ? Math.min((totalAmount * coupon.discountValue) / 100, coupon.maxDiscount ?? Infinity)
        : coupon.discountValue;
    couponId = coupon.id;
  }

  const finalAmount = Math.max(0, totalAmount - couponDiscount);

  // If free, create completed order directly
  if (finalAmount === 0) {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        discount: couponDiscount,
        finalAmount: 0,
        status: "COMPLETED",
        couponId,
        couponCode,
        couponDiscount,
        items: { create: notes.map((n) => ({ noteId: n.id, price: 0 })) },
      },
    });
    await prisma.note.updateMany({ where: { id: { in: noteIds } }, data: { purchaseCount: { increment: 1 } } });
    return NextResponse.json({ order, free: true });
  }

  // Create Razorpay order
  const receipt = `nvx_${Date.now()}`;
  const rzpOrder = await createRazorpayOrder(finalAmount, "INR", receipt);

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalAmount,
      discount: couponDiscount,
      finalAmount,
      status: "PENDING",
      razorpayOrderId: rzpOrder.id,
      couponId,
      couponCode,
      couponDiscount,
      items: { create: notes.map((n) => ({ noteId: n.id, price: n.price })) },
    },
  });

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: finalAmount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    prefill: { name: session.user.name, email: session.user.email },
  });
}
