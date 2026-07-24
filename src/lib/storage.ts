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

  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body,
      signal: controller.signal
    });
    const result = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    if (!response.ok || !result?.url) {
      throw new Error(result?.error || "No se pudo subir la imagen.");
    }
    return result.url;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La subida tardo demasiado. Revise su conexion e intente de nuevo.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
