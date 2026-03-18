import crypto from "crypto";

/* -------------------- Types -------------------- */

export interface FileResponse {
  name: string;
  url: string;
  size: number;
  type: "video" | "image" | "audio" | "raw";
  createdAt: string;
}

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  original_filename: string;
  secure_url: string;
  bytes: number;
  resource_type: "image" | "video" | "raw";
  created_at: string;
}

/* -------------------- Upload Function -------------------- */

export const uploadFile = async (
  file: UploadInput,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<FileResponse> => {
  const timestamp = Math.floor(Date.now() / 1000);

  /* 1. Resolve resource type */
  let resourceType: "image" | "video" | "raw" = "raw";

  if (file.mimeType.startsWith("image/")) {
    resourceType = "image";
  } else if (
    file.mimeType.startsWith("video/") ||
    file.mimeType.startsWith("audio/")
  ) {
    resourceType = "video"; // Cloudinary rule
  }

  const publicId = file.originalName.replace(/\.[^/.]+$/, "");

  /* 2. Generate signature */
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  /* 3. Build Bun-native FormData */
  const formData = new FormData();

  formData.append(
    "file",
    new Blob([file.buffer], { type: file.mimeType }),
    file.originalName
  );

  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("public_id", publicId);
  formData.append("signature", signature);

  /* 4. Upload */
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  /* 5. Typed response */
  const data = (await res.json()) as CloudinaryUploadResponse;

  /* 6. Normalize response */
  return {
    name: data.original_filename ?? data.public_id,
    url: data.secure_url,
    size: data.bytes,
    type: file.mimeType.startsWith("audio")
      ? "audio"
      : data.resource_type,
    createdAt: data.created_at,
  };
};
