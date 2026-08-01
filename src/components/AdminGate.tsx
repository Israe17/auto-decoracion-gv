"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

// Todas las fallas de acceso mostraban "correo o contraseña incorrectos".
// Eso esconde causas muy distintas: la mas traicionera es el bloqueo
// temporal por intentos repetidos, porque quien lo sufre sigue probando
// la contraseña correcta y el sitio le insiste en que esta mal. Los
// codigos son los de Supabase Auth (AuthApiError.code).
function mensajeDeError(fallo: { code?: string; status?: number; message?: string }) {
  switch (fallo.code) {
    case "over_request_rate_limit":
      return "Demasiados intentos: el acceso quedó bloqueado por unos minutos. Espere y vuelva a intentar.";
    case "email_not_confirmed":
      return "El correo del administrador aún no está confirmado en Supabase.";
    case "user_banned":
      return "Esta cuenta está suspendida. Revísela en el panel de Supabase.";
    case "validation_failed":
      return "El correo no tiene un formato válido.";
    default:
      if (fallo.status && fallo.status >= 500) {
        return "No se pudo conectar con el servidor. Intente de nuevo en un momento.";
      }
      return "Correo o contraseña incorrectos, o el usuario no está autorizado.";
  }
}

export function AdminGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(supabaseEnabled);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cliente = getSupabase();
    if (!cliente) return;

    // `onAuthStateChange` no dispara con la sesion ya guardada, asi que
    // primero se pregunta por ella; si no, el panel se quedaria en
    // "Verificando sesion" al recargar con sesion abierta.
    cliente.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
    });

    const { data: sub } = cliente.auth.onAuthStateChange((_evento, sesion) => {
      setUser(sesion?.user ?? null);
      setChecking(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const cliente = getSupabase();
    if (!cliente) return;

    setSubmitting(true);
    setError("");
    const { error: fallo } = await cliente.auth.signInWithPassword({ email, password });
    if (fallo) setError(mensajeDeError(fallo));
    setSubmitting(false);
  }

  // Sin Supabase la app corre en modo demo local y el panel queda abierto.
  if (!supabaseEnabled) return <>{children}</>;

  // El overlay se mantiene SIEMPRE montado y solo cambia `show`: si se
  // desmontara al terminar la verificacion, su animacion de salida (la
  // apertura de las dos mitades) nunca llegaria a verse.
  return (
    <>
      <LoadingOverlay show={checking} label="Verificando sesión" />

      {!checking && !user && (
        <section className="section admin-login">
          <div className="admin-login__card">
            <div className="admin-login__icon">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1>Panel privado</h1>
              <p>Inicie sesión con la cuenta de administrador del negocio.</p>
            </div>
            {error && <div className="admin-login__error">{error}</div>}
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                Correo
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                Contraseña
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </label>
              <button className="button button--primary" type="submit" disabled={submitting}>
                <LogIn size={18} /> {submitting ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </section>
      )}

      {!checking && user && (
        <>
          <div className="admin-session-bar">
            <div className="admin-session-bar__identity">
              <span className="admin-session-bar__status" aria-hidden="true" />
              <span>
                <small>Sesión activa</small>
                <strong title={user.email || undefined}>{user.email}</strong>
              </span>
            </div>
            <button
              type="button"
              aria-label="Cerrar sesión"
              onClick={() => {
                getSupabase()?.auth.signOut();
              }}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
          {children}
        </>
      )}
    </>
  );
}
