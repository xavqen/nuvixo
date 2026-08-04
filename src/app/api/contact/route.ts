import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { apiRateLimiter } from "@/lib/utils";

const contactSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const contentType = req.headers.get("content-type") ?? "";
  let body: Record<string, unknown>;

  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const formData = await req.formData();
    body = Object.fromEntries(formData.entries());
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 422 });
  }

  const { name, email, subject, message } = parsed.data;

  await sendEmail({
    to: process.env.SMTP_FROM ?? "hello@nuvixo.com",
    subject: `[Contact Form] ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  }).catch(() => {});

  return NextResponse.json({ message: "Thank you! We'll get back to you within 24 hours." });
}
