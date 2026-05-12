import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { motion } from "motion/react";
import type { Route } from "./+types/login";
import {
  getSession,
  commitSession,
  validateCredentials,
} from "~/services/auth/session.server";

export function meta() {
  return [{ title: "HELIOS_DECK — Iniciar Sesión" }];
}

// Already logged in → skip login page
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.get("userId")) throw redirect("/dashboard");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form     = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!username || !password) {
    return { error: "Completa todos los campos." };
  }

  if (!validateCredentials(username, password)) {
    return { error: "Credenciales incorrectas." };
  }

  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", username.toLowerCase());
  return redirect("/dashboard", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

// ─── TextureCard — cult-ui inspired 5-layer nested border card ───────────────
function TextureCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative"
      style={{
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.55)",
        padding: 1,
      }}
    >
      <div style={{ borderRadius: 23, border: "1px solid rgba(0,0,0,0.12)", padding: 1 }}>
        <div style={{ borderRadius: 22, border: "1px solid rgba(0,0,0,0.90)", padding: 1 }}>
          <div style={{ borderRadius: 21, border: "1px solid rgba(0,0,0,0.65)", padding: 1 }}>
            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.40)",
                background: "linear-gradient(160deg, rgba(8,17,40,0.82) 0%, rgba(3,9,22,0.94) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                padding: "36px 32px",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CosmicButton — spinning conic gradient border on hover/loading ──────────
function CosmicButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        padding: "1px",
        background: "transparent",
        border: "none",
        cursor: loading ? "wait" : "pointer",
      }}
    >
      {/* Spinning conic border */}
      <span
        className="absolute rounded-2xl"
        style={{
          inset: "-200%",
          background: "conic-gradient(from 0deg, oklch(0.7 0.2 200), oklch(0.65 0.25 264), oklch(0.8 0.15 300), oklch(0.7 0.2 200))",
          animation: "cosmicSpin 3s linear infinite",
        }}
      />
      {/* Button surface */}
      <span
        className="relative z-10 flex items-center justify-center w-full rounded-[15px] font-mono font-bold tracking-widest uppercase"
        style={{
          background: "linear-gradient(180deg, rgba(43,98,214,0.90) 0%, rgba(20,50,140,0.95) 100%)",
          color: "#e0f2ff",
          fontSize: "12px",
          letterSpacing: "0.22em",
          padding: "13px 0",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 6px rgba(0,0,0,0.30)",
          transition: "opacity 0.2s",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Verificando…" : "Entrar al Observatorio"}
      </span>
    </button>
  );
}

export default function LoginPage() {
  const actionData  = useActionData<typeof action>();
  const navigation  = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showPass, setShowPass] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#020811" }}
    >
      {/* Animated nebula blobs */}
      <div className="blob-orb absolute top-[-15%] left-[-10%] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(43,98,214,0.28) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="blob-orb blob-delay-4 absolute bottom-[-10%] right-[-8%] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)", filter: "blur(90px)" }} />
      <div className="blob-orb blob-delay-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,30,80,0.45) 0%, transparent 65%)", filter: "blur(60px)" }} />

      {/* Star field — pure CSS dots */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.55) 0%, transparent 100%), radial-gradient(1px 1px at 75% 8%, rgba(255,255,255,0.45) 0%, transparent 100%), radial-gradient(1px 1px at 45% 82%, rgba(255,255,255,0.35) 0%, transparent 100%), radial-gradient(1px 1px at 88% 60%, rgba(255,255,255,0.40) 0%, transparent 100%), radial-gradient(1px 1px at 22% 55%, rgba(255,255,255,0.30) 0%, transparent 100%), radial-gradient(1px 1px at 60% 30%, rgba(255,255,255,0.50) 0%, transparent 100%)",
      }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10 mx-4"
      >
        <TextureCard>
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-3 flex items-center justify-center"
              style={{
                width: 52, height: 52, borderRadius: 16,
                background: "rgba(59,130,246,0.16)",
                border: "1px solid rgba(59,130,246,0.40)",
                boxShadow: "0 0 32px rgba(59,130,246,0.30)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(147,197,253,0.90)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" /><line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
                <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" /><line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
              </svg>
            </div>
            <h1 className="font-mono font-black tracking-[0.22em] uppercase"
              style={{ fontSize: 18, color: "#e0f2ff", letterSpacing: "0.22em" }}>
              HELIOS_DECK
            </h1>
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(147,197,253,0.45)", letterSpacing: "0.16em", marginTop: 4, textTransform: "uppercase" }}>
              Observatorio de Clima Espacial
            </p>
          </div>

          {/* Form */}
          <Form method="post" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(147,197,253,0.55)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="admin"
                className="w-full rounded-xl font-mono"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(224,242,255,0.90)",
                  fontSize: 13,
                  padding: "10px 14px",
                  outline: "none",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.25)",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.55)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(147,197,253,0.55)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl font-mono"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(224,242,255,0.90)",
                    fontSize: 13,
                    padding: "10px 40px 10px 14px",
                    outline: "none",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.25)",
                    transition: "border-color 0.2s",
                    width: "100%",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.55)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(147,197,253,0.40)", fontSize: 11, fontFamily: "monospace", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPass ? "ocultar" : "ver"}
                </button>
              </div>
            </div>

            {/* Error */}
            {actionData?.error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-center"
                style={{ fontSize: 11, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", borderRadius: 10, padding: "8px 12px" }}
              >
                {actionData.error}
              </motion.p>
            )}

            <div className="mt-2">
              <CosmicButton loading={isSubmitting} />
            </div>
          </Form>

          {/* Demo hint */}
          <p className="text-center font-mono mt-5" style={{ fontSize: 10, color: "rgba(147,197,253,0.28)", letterSpacing: "0.06em" }}>
            demo: <span style={{ color: "rgba(147,197,253,0.50)" }}>admin</span> / <span style={{ color: "rgba(147,197,253,0.50)" }}>helios2025</span>
          </p>
        </TextureCard>
      </motion.div>
    </div>
  );
}
