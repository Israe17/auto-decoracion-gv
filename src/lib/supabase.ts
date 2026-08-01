import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sin credenciales la app corre en modo demo (datos de ejemplo en publico,
// localStorage en el admin), igual que antes con Firebase (el fallback no cambia).
export const supabaseEnabled = Boolean(url && anonKey);

let cliente: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseEnabled) return null;
  // Una sola instancia: crear varias rompe la persistencia de la sesion.
  cliente ||= createClient(url!, anonKey!);
  return cliente;
}

export function requireSupabase() {
  const cliente = getSupabase();
  if (!cliente) throw new Error("Supabase no esta configurado.");
  return cliente;
}
