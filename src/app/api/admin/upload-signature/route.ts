import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const type = body?.type === "image" ? "image" : "pdf";

    const timestamp = Math.floor(Date.now() / 1000);

    const folder =
      type === "pdf"
        ? "studiya/pdfs"
        : "studiya/covers";

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      resourceType: type === "pdf" ? "raw" : "image",
    });
  } catch (error) {
    console.error("UPLOAD_SIGNATURE_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate upload signature.",
      },
      { status: 500 }
    );
  }
}