import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  KeyRound,
  Users,
  ClipboardList,
} from "lucide-react";
import { authService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, AuthResponse } from "@/types";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const res = await authService.login(data.email, data.password);
      const body = res.data as ApiResponse<AuthResponse>;
      if (body.success) {
        login(body.data);
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      setApiError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Credenciales inválidas. Intenta de nuevo.",
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#cfdafa" }}
    >
      {/* ── Panel principal ── */}
      <div className="relative w-full max-w-4xl flex overflow-hidden animate-fade-in loginpanel">
        {/* ══════════════════════════════════════════
            PANEL IZQUIERDO — Formulario
        ══════════════════════════════════════════ */}
        <div className="relative z-10 bg-white flex flex-col justify-center px-10 py-12 w-full lg:w-[48%] flex-shrink-0">
          <div className="max-w-sm w-full mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              Iniciar sesión
            </h1>
            <p className="text-sm text-slate-400 mb-8">
              Accede a tu panel de administración
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* Error API */}
              {apiError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 animate-slide-up">
                  <AlertCircle
                    size={15}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="Correo electrónico"
                  aria-label="Correo electrónico"
                  aria-invalid={!!errors.email}
                  style={{
                    background: "#F1F3F5",
                    border: errors.email
                      ? "1.5px solid #ef4444"
                      : "1.5px solid transparent",
                    borderRadius: "12px",
                    padding: "13px 16px",
                    width: "100%",
                    fontSize: "14px",
                    color: "#1e293b",
                    outline: "none",
                    transition: "border-color .15s, box-shadow .15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#17A2B8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(23,162,184,.12)";
                  }}
                  {...register("email", {
                    // Pasamos el onBlur aquí adentro para que React Hook Form
                    // ejecute tu diseño Y ADEMÁS procese la validación del campo
                    onBlur: (e) => {
                      e.target.style.borderColor = errors.email
                        ? "#ef4444"
                        : "transparent";
                      e.target.style.boxShadow = "none";
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    aria-label="Contraseña"
                    aria-invalid={!!errors.password}
                    style={{
                      background: "#F1F3F5",
                      border: errors.password
                        ? "1.5px solid #ef4444"
                        : "1.5px solid transparent",
                      borderRadius: "12px",
                      padding: "13px 44px 13px 16px",
                      width: "100%",
                      fontSize: "14px",
                      color: "#1e293b",
                      outline: "none",
                      transition: "border-color .15s, box-shadow .15s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#17A2B8";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(23,162,184,.12)";
                    }}
                   
                    {...register("password",{
                      onBlur: (e) => {
                      e.target.style.borderColor = errors.password
                        ? "#ef4444"
                        : "transparent";
                      e.target.style.boxShadow = "none";
                    },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={
                      showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-medium transition-colors"
                  style={{ color: "#17A2B8" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#0e7a8a")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#17A2B8")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-submitlogin"
                
                onMouseOver={(e) => {
                  if (!isSubmitting) e.currentTarget.style.opacity = "0.92";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verificando…
                  </>
                ) : (
                  "INICIAR SESIÓN"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              AuthServer Admin · v0.1.0
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            PANEL DERECHO — Bienvenida con curva orgánica
        ══════════════════════════════════════════ */}
        <div
          className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden px-12 py-12"
          style={{
            background:
              "linear-gradient(145deg, #067080 0%, #0bbc87 75%, #09b67a 100%)",
          }}
        >
          {/* Curva orgánica izquierda que abraza el panel blanco */}
          <svg
            viewBox="0 0 120 540"
            className="absolute left-0 top-0 h-full"
            style={{ width: "90px" }}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M120,0 C60,80 20,160 50,270 C80,380 60,450 120,540 L0,540 L0,0 Z"
              fill="white"
            />
          </svg>

          {/* Círculos decorativos de fondo */}
          <div
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              background: "rgba(255,255,255,0.07)",
              top: -60,
              right: -60,
            }}
            aria-hidden
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 180,
              height: 180,
              background: "rgba(255,255,255,0.06)",
              bottom: -40,
              left: 20,
            }}
            aria-hidden
          />

          {/* Contenido */}
          <div className="relative z-10 text-center max-w-xs">
            {/* Icono */}
            <div
              className="mx-auto mb-6 flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                borderRadius: "20px",
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <ShieldCheck size={36} className="text-white" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-1">Bienvenido</h2>
            <p className="text-lg font-bold text-white/90 mb-3">AuthServer</p>
            <p className="text-sm text-white/80 leading-relaxed mb-8">
              Panel de administración para gestionar usuarios, roles y permisos
              del sistema.
            </p>

            {/* Features */}
            <div className="space-y-3 text-left">
              {[
                {
                  icon: KeyRound,
                  text: "Autenticación JWT con refresh tokens",
                },
                { icon: Users, text: "Gestión completa de usuarios y roles" },
                {
                  icon: ClipboardList,
                  text: "Registro de auditoría en tiempo real",
                },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Icon size={15} className="text-white" aria-hidden />
                  </div>
                  <span className="text-sm text-white font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Destello de fondo ── */
function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(23,162,184,0.18) 0%, rgba(40,208,148,0.10) 50%, transparent 70%)",
        ...style,
        height: style.width,
      }}
    />
  );
}
