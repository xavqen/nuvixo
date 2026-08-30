import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { cloudinary } from "@/lib/cloudinary";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const formData = await req.formData();

    const file = formData.get("file");
    const type = String(formData.get("type") ?? "image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const maxSize =
      type === "pdf"
        ? 50 * 1024 * 1024
        : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Max ${
            type === "pdf" ? "50MB" : "5MB"
          }.`,
        },
        { status: 413 }
      );
    }

    const allowedPdfTypes = ["application/pdf"];
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      type === "pdf" &&
      !allowedPdfTypes.includes(file.type)
    ) {
      return NextResponse.json(
        { error: "Only PDF files allowed." },
        { status: 415 }
      );
    }

    if (
      type === "image" &&
      !allowedImageTypes.includes(file.type)
    ) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP images allowed." },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pages = 0;

    // Count PDF pages locally instead of depending on Cloudinary's
    // result.pages for raw PDFs.
    if (type === "pdf") {
      try {
        const pdf = await PDFDocument.load(buffer, {
          ignoreEncryption: false,
        });

        pages = pdf.getPageCount();

        if (pages < 1) {
          return NextResponse.json(
            { error: "The PDF contains no pages." },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          {
            error:
              "Invalid or encrypted PDF. Please upload a normal PDF file.",
          },
          { status: 400 }
        );
      }
    }

    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const folder =
      type === "pdf"
        ? "studiya/pdfs"
        : "studiya/covers";

    const resourceType =
      type === "pdf"
        ? "raw"
        : "image";

    const result = await cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,

        ...(type === "image" && {
          transformation: [
            {
              width: 800,
              height: 1100,
              crop: "fill",
              gravity: "auto",
            },
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        }),
      }
    );

    return NextResponse.json({
      success: true,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      format: result.format,
      pages,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("UPLOAD_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed.",
      },
      { status: 500 }
    );
  }
}