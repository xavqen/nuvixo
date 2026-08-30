import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

export async function getSignedPdfUrl(
  publicId: string,
  expiresIn = 3600
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  return cloudinary.utils.private_download_url(
    publicId,
    "pdf",
    {
      resource_type: "raw",
      type: "upload",
      expires_at: expiresAt,
      attachment: false,
    }
  );
}

export async function uploadPdf(
  filePath: string,
  folder: string = "studiya/pdfs"
): Promise<{ publicId: string; secureUrl: string; pages: number }> {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    pages: result.pages ?? 0,
  };
}

export async function uploadImage(
  filePath: string,
  folder: string = "studiya/covers"
): Promise<{ publicId: string; url: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [
      { width: 800, height: 1100, crop: "fill", gravity: "auto" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return { publicId: result.public_id, url: result.secure_url };
}

export async function deleteResource(publicId: string, resourceType: "image" | "raw" = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
