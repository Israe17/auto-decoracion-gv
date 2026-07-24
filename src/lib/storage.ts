import { firebaseEnabled, getFirebaseServices } from "./firebase";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function uploadAdminImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use una imagen JPG, PNG, WebP o AVIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen no puede pesar mas de 8 MB.");
  }

  const services = getFirebaseServices();
  const token = firebaseEnabled && services?.auth.currentUser
    ? await services.auth.currentUser.getIdToken()
    : "";

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45_000);

  try {
    const signatureResponse = await fetch("/api/admin/images", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ folder }),
      signal: controller.signal
    });
    const signatureResult = (await signatureResponse.json().catch(() => null)) as
      | {
          cloudName?: string;
          apiKey?: string;
          timestamp?: number;
          signature?: string;
          assetFolder?: string;
          transformation?: string;
          error?: string;
        }
      | null;
    if (
      !signatureResponse.ok ||
      !signatureResult?.cloudName ||
      !signatureResult.apiKey ||
      !signatureResult.timestamp ||
      !signatureResult.signature ||
      !signatureResult.assetFolder ||
      !signatureResult.transformation
    ) {
      throw new Error(signatureResult?.error || "No se pudo autorizar la imagen.");
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", signatureResult.apiKey);
    uploadForm.append("timestamp", String(signatureResult.timestamp));
    uploadForm.append("asset_folder", signatureResult.assetFolder);
    uploadForm.append("transformation", signatureResult.transformation);
    uploadForm.append("signature", signatureResult.signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signatureResult.cloudName)}/image/upload`,
      { method: "POST", body: uploadForm, signal: controller.signal }
    );
    const uploadResult = (await uploadResponse.json().catch(() => null)) as
      | { secure_url?: string; error?: { message?: string } }
      | null;
    if (!uploadResponse.ok || !uploadResult?.secure_url) {
      throw new Error(uploadResult?.error?.message || "Cloudinary rechazo la imagen.");
    }
    return uploadResult.secure_url;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La subida tardo demasiado. Revise su conexion e intente de nuevo.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
