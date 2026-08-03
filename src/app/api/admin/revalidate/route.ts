import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function isAuthorized(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return process.env.NODE_ENV === "development";

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return false;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  return response.ok;
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json(
      { error: "La sesion del administrador no es valida." },
      { status: 401 }
    );
  }

  // Todas estas vistas leen el mismo catalogo. Los patrones dinamicos
  // cubren categorias y fichas sin conocer de antemano el slug modificado.
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/categoria/[slug]", "page");
  revalidatePath("/productos/[slug]", "page");
  revalidatePath("/contacto");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true });
}
