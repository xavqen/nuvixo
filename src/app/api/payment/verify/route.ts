import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { verifyRazorpayPayment } from "@/lib/razorpay";
import { generateInvoiceNumber } from "@/lib/utils";
import { sendEmail, getPurchaseConfirmationHtml } from "@/lib/email";
import { z } from "zod";

const verifySchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 422 });

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    include: { items: { include: { note: { select: { id: true, title: true } } } } },
  });

  if (!order || order.status === "COMPLETED") {
    return NextResponse.json({ error: "Order not found or already processed." }, { status: 400 });
  }

  // Update order
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod: "razorpay",
    },
  });

  // Update note purchase counts
  const noteIds = order.items.map((i) => i.noteId);
  await prisma.note.updateMany({
    where: { id: { in: noteIds } },
    data: { purchaseCount: { increment: 1 } },
  });

  // Update coupon usage
  if (order.couponId) {
    await prisma.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
  }

  // Generate invoice
  const invoiceNumber = generateInvoiceNumber();
  await prisma.invoice.create({
    data: {
      orderId,
      userId: session.user.id,
      invoiceNumber,
      amount: order.totalAmount - order.couponDiscount,
      tax: 0,
      totalAmount: order.finalAmount,
    },
  });

  // Send confirmation email
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.email) {
    sendEmail({
      to: user.email,
      subject: "Purchase Confirmed – Studiya",
      html: getPurchaseConfirmationHtml(
        user.name ?? "Student",
        order.items.map((i) => ({ title: i.note.title })),
        order.finalAmount,
        invoiceNumber
      ),
    }).catch(() => {});
  }

  // Add notification
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Purchase Successful! 🎉",
      message: `You now have access to ${order.items.length} note(s). Start reading!`,
      type: "success",
      link: "/dashboard/notes",
    },
  });

  return NextResponse.json({ success: true, invoiceNumber });
}
