import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseEnabled, getFirebaseServices } from "./firebase";

function slugifyFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  const slug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "imagen"}${ext.toLowerCase()}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Sube la imagen a Firebase Storage (carpeta admin/{folder}); si Firebase no
// esta configurado (modo demo) la codifica como data URL para que el admin
// siga funcionando con localStorage.
export async function uploadAdminImage(file: File, folder: string): Promise<string> {
  const services = getFirebaseServices();

  if (!firebaseEnabled || !services) {
    return fileToDataUrl(file);
  }

  const path = `${folder}/${Date.now()}-${slugifyFileName(file.name)}`;
  const storageRef = ref(services.storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
