import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Lock, Monitor, Smartphone,
  AlertCircle, Loader2, CheckCircle2, X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useMe, useChangePassword } from '@/hooks/useUsers'
import { timeAgo, initials, roleBadgeClass } from '@/utils'
import { cn } from '@/utils'

// ─── Esquemas de validación ───────────────────────────────────
const passwordSchema = z
  .object({
    current:  z.string().min(1, 'Requerido'),
    next:     z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/,       'Debe tener mayúscula')
      .regex(/[a-z]/,       'Debe tener minúscula')
      .regex(/\d/,          'Debe tener número')
      .regex(/[^A-Za-z0-9]/, 'Debe tener carácter especial'),
    confirm: z.string().min(1, 'Requerido'),
  })
  .refine((d) => d.next === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirm'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

// ─── Sesiones mock (en un backend real vendrían del API) ──────
const SESSIONS = [
  { id: '1', device: 'Linux · Chrome 148',   ip: '192.168.1.4', time: null,         current: true  },
  { id: '2', device: 'Android · Chrome',     ip: '10.0.0.8',    time: '2026-05-23T17:00:00Z', current: false },
  { id: '3', device: 'Windows · Firefox 126',ip: '192.168.1.12',time: '2026-05-22T09:30:00Z', current: false },
]

// ─── Sub-componente: campo de formulario ──────────────────────
function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className={cn(
        'block text-xs font-semibold mb-1.5 uppercase tracking-wider',
        error ? 'text-red-600' : 'text-slate-500',
      )}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

// ─── Sub-componente: toast de éxito ───────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 animate-slide-up">
      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
      <p className="text-sm text-emerald-800 flex-1">{message}</p>
      <button onClick={onClose} className="text-emerald-500 hover:text-emerald-700">
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────
export default function ProfilePage() {
  const { user: storeUser, logout } = useAuthStore()
  const { data: me, isLoading }     = useMe()
  const changePassword              = useChangePassword()
  const [sessions, setSessions]     = useState(SESSIONS)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [apiError, setApiError]     = useState<string | null>(null)

  const user = me ?? storeUser

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const onPasswordSubmit = async (data: PasswordForm) => {
    setApiError(null)
    setSuccessMsg(null)
    try {
      await changePassword.mutateAsync({ current: data.current, next: data.next })
      reset()
      setSuccessMsg('Contraseña actualizada. Cierra sesión y vuelve a ingresar.')
    } catch (err: unknown) {
      setApiError(
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Error al cambiar la contraseña',
      )
    }
  }

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const revokeAllSessions = async () => {
    setSessions((prev) => prev.filter((s) => s.current))
    setSuccessMsg('Todas las sesiones externas han sido cerradas.')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    )
  }

  const userInitials  = user?.email ? initials(user.email) : 'AU'
  const displayName   = user?.username ?? user?.email?.split('@')[0] ?? '—'
  const roles: string[] = (user as { roles?: string[] })?.roles ?? []

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900">Mi perfil</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gestiona tu cuenta y seguridad
        </p>
      </div>

      {/* Toast global */}
      {successMsg && (
        <Toast message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Columna izquierda: info de cuenta ─────────────── */}
        <div className="space-y-4">

          {/* Avatar + datos */}
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-700 mb-4">
              {userInitials}
            </div>
            <p className="text-base font-bold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500 mt-0.5 break-all">{user?.email}</p>

            {/* Roles */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              {roles.length > 0
                ? roles.map((r) => (
                    <span key={r} className={roleBadgeClass(r)}>{r}</span>
                  ))
                : <span className="text-xs text-slate-400">Sin roles</span>
              }
            </div>

            {/* Estado */}
            <div className="mt-4 pt-4 border-t border-slate-100 w-full space-y-2">
              <InfoRow label="Estado">
                <span className={user?.active ? 'status-active' : 'status-inactive'}>
                  {user?.active ? 'Activo' : 'Inactivo'}
                </span>
              </InfoRow>
              <InfoRow label="Verificado">
                <span className={user?.verified ? 'status-active' : 'badge-viewer'}>
                  {user?.verified ? 'Sí' : 'Pendiente'}
                </span>
              </InfoRow>
              {user?.lastLoginAt && (
                <InfoRow label="Último login">
                  <span className="text-xs text-slate-500">
                    {timeAgo(user.lastLoginAt as unknown as string)}
                  </span>
                </InfoRow>
              )}
              {user?.createdAt && (
                <InfoRow label="Registrado">
                  <span className="text-xs text-slate-500">
                    {timeAgo(user.createdAt as unknown as string)}
                  </span>
                </InfoRow>
              )}
            </div>
          </div>

          {/* Sesiones activas */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={15} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">Sesiones activas</h2>
            </div>

            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  {s.device.toLowerCase().includes('android') || s.device.toLowerCase().includes('iphone')
                    ? <Smartphone size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    : <Monitor    size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{s.device}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.ip}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {s.current ? (
                        <span className="text-emerald-600 font-medium">sesión actual</span>
                      ) : timeAgo(s.time)}
                    </p>
                  </div>
                  {!s.current && (
                    <button
                      onClick={() => revokeSession(s.id)}
                      className="btn-icon w-6 h-6 text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      aria-label="Revocar sesión"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {sessions.length > 1 && (
              <button
                onClick={revokeAllSessions}
                className="mt-4 w-full text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-lg py-2 transition-all flex items-center justify-center gap-1.5 font-medium"
              >
                Cerrar todas las demás sesiones
              </button>
            )}
          </div>
        </div>

        {/* ── Columna derecha: formularios ──────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Información de cuenta */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <User size={15} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">Información de cuenta</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</p>
                <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono truncate">
                  {user?.email ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Username</p>
                <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono">
                  {user?.username ?? <span className="text-slate-400">no establecido</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">ID de usuario</p>
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono truncate">
                  {user?.id ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Roles asignados</p>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 min-h-[36px]">
                  {roles.length > 0
                    ? roles.map((r) => <span key={r} className={roleBadgeClass(r)}>{r}</span>)
                    : <span className="text-xs text-slate-400">ninguno</span>
                  }
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Para cambiar el email o username contacta a otro administrador.
            </p>
          </div>

          {/* Cambiar contraseña */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={15} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">Cambiar contraseña</h2>
            </div>

            {apiError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onPasswordSubmit)} noValidate className="space-y-4">
              <Field label="Contraseña actual" error={errors.current?.message}>
                <input
                  type="password"
                  placeholder="Tu contraseña actual"
                  className="input-base"
                  aria-invalid={!!errors.current}
                  {...register('current')}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Nueva contraseña" error={errors.next?.message}>
                  <input
                    type="password"
                    placeholder="Mín. 8 chars"
                    className="input-base"
                    aria-invalid={!!errors.next}
                    {...register('next')}
                  />
                </Field>
                <Field label="Confirmar contraseña" error={errors.confirm?.message}>
                  <input
                    type="password"
                    placeholder="Repite la contraseña"
                    className="input-base"
                    aria-invalid={!!errors.confirm}
                    {...register('confirm')}
                  />
                </Field>
              </div>

              {/* Requisitos */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-semibold text-slate-600 mb-2">Requisitos:</p>
                <ul className="grid grid-cols-2 gap-1">
                  {[
                    'Mínimo 8 caracteres',
                    'Al menos una mayúscula',
                    'Al menos una minúscula',
                    'Al menos un número',
                    'Al menos un símbolo especial',
                  ].map((req) => (
                    <li key={req} className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-400">
                  Al cambiar la contraseña se cerrarán todas las sesiones activas.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs px-5"
                >
                  {isSubmitting
                    ? <><Loader2 size={13} className="animate-spin" /> Guardando…</>
                    : 'Actualizar contraseña'
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Zona de peligro */}
          <div className="card p-6 border-red-200">
            <h2 className="text-sm font-semibold text-red-700 mb-1">Zona de peligro</h2>
            <p className="text-xs text-slate-500 mb-4">
              Estas acciones son irreversibles. Procede con cuidado.
            </p>
            <button
              onClick={() => { logout(); window.location.href = '/login' }}
              className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-lg px-4 py-2 transition-all font-medium"
            >
              Cerrar sesión en todos los dispositivos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  )
}
