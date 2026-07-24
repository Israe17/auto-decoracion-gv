import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ALLOWED_FOLDERS = new Set(["products", "categories", "promos", "brands"]);
const UPLOAD_TRANSFORMATION = "c_limit,w_1920,h_1920,q_auto:good,f_webp";

function configuredRootFolder() {
  const value = process.env.CLOUDINARY_ASSET_FOLDER || "auto-decoracion-gv";
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/^\/+|\/+$/g, "") || "auto-decoracion-gv";
}

async function isAuthorized(request: Request) {
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!firebaseApiKey) return process.env.NODE_ENV === "development";

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return false;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store"
    }
  );
  if (!response.ok) return false;
  const result = (await response.json()) as { users?: unknown[] };
  return Boolean(result.users?.length);
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "La sesion del administrador no es valida." }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary todavia no esta configurado en el servidor." },
        { status: 503 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const requestedFolder = String(form.get("folder") || "");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibio ninguna imagen." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Use una imagen JPG, PNG, WebP o AVIF." },
        { status: 415 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "La imagen no puede pesar mas de 8 MB." }, { status: 413 });
    }

    const assetFolder = `${configuredRootFolder()}/${
      ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : "misc"
    }`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureSource =
      `asset_folder=${assetFolder}&timestamp=${timestamp}&transformation=${UPLOAD_TRANSFORMATION}${apiSecret}`;
    const signature = createHash("sha1").update(signatureSource).digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", file, file.name);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", String(timestamp));
    uploadForm.append("asset_folder", assetFolder);
    uploadForm.append("transformation", UPLOAD_TRANSFORMATION);
    uploadForm.append("signature", signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: "POST", body: uploadForm, cache: "no-store" }
    );
    const uploadResult = (await uploadResponse.json()) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string };
    };
    if (!uploadResponse.ok || !uploadResult.secure_url) {
      console.error("Cloudinary upload failed:", uploadResult.error?.message || uploadResponse.statusText);
      return NextResponse.json({ error: "Cloudinary rechazo la imagen." }, { status: 502 });
    }

    return NextResponse.json({ url: uploadResult.secure_url, publicId: uploadResult.public_id });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ error: "No se pudo procesar la imagen." }, { status: 500 });
  }
}
