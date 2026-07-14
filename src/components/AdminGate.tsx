"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { firebaseEnabled, getFirebaseServices } from "@/lib/firebase";

export function AdminGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(firebaseEnabled);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled) return;
    const services = getFirebaseServices();
    if (!services) return;

    return onAuthStateChanged(services.auth, (current) => {
      setUser(current);
      setChecking(false);
    });
  }, []);

  // Sin Firebase la app corre en modo demo local y el panel queda abierto.
  if (!firebaseEnabled) return <>{children}</>;

  if (checking) {
    return (
      <section className="section admin-login">
        <p className="admin-empty">Verificando sesion...</p>
      </section>
    );
  }

  if (!user) {
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") || "").trim();
      const password = String(form.get("password") || "");
      const services = getFirebaseServices();
      if (!services) return;

      setSubmitting(true);
      setError("");
      try {
        await signInWithEmailAndPassword(services.auth, email, password);
      } catch {
        setError("Correo o contrasena incorrectos, o el usuario no esta autorizado.");
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <section className="section admin-login">
        <div className="admin-login__card">
          <div className="admin-login__icon">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1>Panel privado</h1>
            <p>Inicie sesion con la cuenta de administrador del negocio.</p>
          </div>
          {error && <div className="admin-login__error">{error}</div>}
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Correo
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Contrasena
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
    );
  }

  return (
    <>
      <div className="admin-session-bar">
        <div className="admin-session-bar__identity">
          <span className="admin-session-bar__status" aria-hidden="true" />
          <span>
            <small>Sesion activa</small>
            <strong title={user.email || undefined}>{user.email}</strong>
          </span>
        </div>
        <button
          type="button"
          aria-label="Cerrar sesion"
          onClick={() => {
            const services = getFirebaseServices();
            if (services) signOut(services.auth);
          }}
        >
          <LogOut size={16} /> Cerrar sesion
        </button>
      </div>
      {children}
    </>
  );
}
