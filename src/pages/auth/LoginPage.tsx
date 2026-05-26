import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { authService } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, AuthResponse } from '@/types'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate   = useNavigate()
  const login      = useAuthStore((s) => s.login)
  const [showPass, setShowPass] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setApiError(null)
    try {
      const res = await authService.login(data.email, data.password)
      const body = res.data as ApiResponse<AuthResponse>
      if (body.success) {
        login(body.data)
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        ?? 'Error al iniciar sesión. Verifica tus credenciales.'
      setApiError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── Panel izquierdo: branding ──────────────────── */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col items-center justify-center p-12 relative overflow-hidden">

        {/* Fondo decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-600/8 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-brand-500/6 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgb(99 102 241 / .4) 1px, transparent 1px), linear-gradient(to right, rgb(99 102 241 / .4) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-900/50">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">AuthServer</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Panel de administración para gestionar usuarios, roles y permisos del sistema.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-3 text-left">
            {[
              { icon: '🔐', label: 'Autenticación JWT con refresh tokens' },
              { icon: '👥', label: 'Gestión completa de usuarios y roles' },
              { icon: '📋', label: 'Registro de auditoría en tiempo real' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-base">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ──────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-100">AuthServer</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Iniciar sesión</h1>
            <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales de administrador</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Error del API */}
            {apiError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-up">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" aria-hidden />
                <p className="text-sm text-red-300">{apiError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="admin@empresa.com"
                className="input-base"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1" role="alert">
                  <AlertCircle size={11} aria-hidden /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-base pr-10"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'pass-error' : undefined}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p id="pass-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1" role="alert">
                  <AlertCircle size={11} aria-hidden /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-11 text-sm mt-2"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" aria-hidden /> Verificando…</>
              ) : (
                'Ingresar al panel'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-600">
            AuthServer Admin · v0.1.0
          </p>
        </div>
      </div>
    </div>
  )
}
