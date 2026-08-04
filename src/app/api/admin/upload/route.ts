import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) ?? "image"; // "pdf" | "image"

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  const maxSize = type === "pdf" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: `File too large. Max ${type === "pdf" ? "50MB" : "5MB"}.` }, { status: 413 });
  }

  const allowedPdfTypes = ["application/pdf"];
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  if (type === "pdf" && !allowedPdfTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF files allowed." }, { status: 415 });
  }
  if (type === "image" && !allowedImageTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP images allowed." }, { status: 415 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const folder = type === "pdf" ? "studiya/pdfs" : "studiya/covers";
  const resourceType = type === "pdf" ? "raw" : "image";

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
    ...(type === "image" && {
      transformation: [
        { width: 800, height: 1100, crop: "fill", gravity: "auto" },
        { quality: "auto", fetch_format: "auto" },
      ],
    }),
  });

  return NextResponse.json({
    publicId: result.public_id,
    secureUrl: result.secure_url,
    format: result.format,
    pages: result.pages,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
  });
}
