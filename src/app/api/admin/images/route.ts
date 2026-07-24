import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    const body = (await request.json().catch(() => null)) as { folder?: string } | null;
    const requestedFolder = String(body?.folder || "");

    const assetFolder = `${configuredRootFolder()}/${
      ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : "misc"
    }`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureSource =
      `asset_folder=${assetFolder}&timestamp=${timestamp}&transformation=${UPLOAD_TRANSFORMATION}${apiSecret}`;
    const signature = createHash("sha1").update(signatureSource).digest("hex");

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      assetFolder,
      transformation: UPLOAD_TRANSFORMATION
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ error: "No se pudo procesar la imagen." }, { status: 500 });
  }
}
