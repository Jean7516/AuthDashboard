import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { authService } from '@/services/api'
import { useQueryClient } from '@tanstack/react-query'
import { USERS_KEY } from '@/hooks/useUsers'
import type { ApiResponse, AuthResponse } from '@/types'
import { cn } from '@/utils'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/\d/, 'Debe tener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe tener al menos un carácter especial'),
  username: z.string().min(3).max(50).optional().or(z.literal('')),
  roleName: z.enum(['viewer', 'admin', 'superadmin']),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export default function UserModal({ open, onClose }: Props) {
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roleName: 'viewer' },
  })

  useEffect(() => { if (!open) reset() }, [open, reset])

  if (!open) return null

  const onSubmit = async (data: FormData) => {
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        username: data.username || undefined,
      })
      await qc.invalidateQueries({ queryKey: [USERS_KEY] })
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Error al crear el usuario'
      setError('root', { message: msg })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Crear nuevo usuario"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-md card p-6 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Nuevo usuario</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Crea una cuenta y asigna un rol inicial
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {errors.root && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300">{errors.root.message}</p>
            </div>
          )}

          {/* Email */}
          <Field label="Email *" error={errors.email?.message}>
            <input
              type="email"
              placeholder="usuario@empresa.com"
              className="input-base"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>

          {/* Username */}
          <Field label="Username" error={errors.username?.message}>
            <input
              type="text"
              placeholder="usuario_123 (opcional)"
              className="input-base"
              {...register('username')}
            />
          </Field>

          {/* Password */}
          <Field label="Contraseña *" error={errors.password?.message}>
            <input
              type="password"
              placeholder="Mín. 8 chars, mayúscula, número y símbolo"
              className="input-base"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
          </Field>

          {/* Rol */}
          <Field label="Rol inicial *" error={errors.roleName?.message}>
            <select className="input-base" {...register('roleName')}>
              <option value="viewer">viewer — Solo lectura</option>
              <option value="admin">admin — Administrador</option>
              <option value="superadmin">superadmin — Acceso total</option>
            </select>
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting
                ? <><Loader2 size={14} className="animate-spin" /> Creando…</>
                : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className={cn(
        'block text-xs font-medium mb-1.5 uppercase tracking-wider',
        error ? 'text-red-400' : 'text-slate-400',
      )}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-400 flex items-center gap-1" role="alert">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}
