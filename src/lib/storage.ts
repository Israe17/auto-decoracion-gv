import { requireSupabase } from "./supabase";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ALLOWED_FOLDERS = new Set(["products", "categories", "promos", "brands"]);
const MEDIA_BUCKET = "catalog-media";

export async function uploadAdminImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use una imagen JPG, PNG, WebP o AVIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen no puede pesar mas de 8 MB.");
  }

  const client = requireSupabase();
  const safeFolder = ALLOWED_FOLDERS.has(folder) ? folder : "misc";
  const extension = file.type === "image/avif" ? "avif" : file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false
  });
  if (error) {
    if (/row-level security|unauthorized|jwt/i.test(error.message)) {
      throw new Error("La sesion del administrador vencio. Ingrese de nuevo para subir la imagen.");
    }
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  return client.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
