import { X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAssignRole } from '@/hooks/useUsers'
import type { UserResponse } from '@/types'
import { initials, avatarColor } from '@/utils'

interface Props {
  user: UserResponse | null
  onClose: () => void
}

export default function RoleModal({ user, onClose }: Props) {
  const assignRole = useAssignRole()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ roleName: string }>({
    defaultValues: { roleName: 'viewer' },
  })

  if (!user) return null

  const onSubmit = async (data: { roleName: string }) => {
    await assignRole.mutateAsync({ userId: user.id, roleName: data.roleName })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-sm card p-6 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-slate-100">Asignar rol</h2>
          <button onClick={onClose} className="btn-icon" aria-label="Cerrar"><X size={15} /></button>
        </div>

        {/* User chip */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 mb-5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(user.email)}`}>
            {initials(user.email)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user.email}</p>
            <p className="text-[10px] text-slate-500">
              Roles actuales: {user.roles.length > 0 ? user.roles.join(', ') : 'ninguno'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Nuevo rol
            </label>
            <select className="input-base" {...register('roleName')}>
              <option value="viewer">viewer — Solo lectura</option>
              <option value="admin">admin — Administrador</option>
              <option value="superadmin">superadmin — Acceso total</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Asignar rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
