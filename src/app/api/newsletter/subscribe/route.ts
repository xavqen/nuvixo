import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { apiRateLimiter } from "@/lib/utils";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email." }, { status: 422 });

  const { email, name } = parsed.data;

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isActive: true, name },
    create: { email, name, confirmedAt: new Date() },
  });

  return NextResponse.json({ message: "Subscribed successfully!" });
}
