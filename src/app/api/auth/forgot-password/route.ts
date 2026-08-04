import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateToken } from "@/lib/utils";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";
import { authRateLimiter } from "@/lib/utils";

const forgotSchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = authRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email." }, { status: 422 });

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  }

  // Delete existing tokens
  await prisma.verificationToken.deleteMany({ where: { identifier: `reset:${email}` } });

  const token = generateToken();
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
      userId: user.id,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset your Nuvixo password",
    html: getPasswordResetEmailHtml(user.name ?? "User", resetUrl),
  });

  return NextResponse.json({ message: "If an account exists, a reset link was sent." });
}
