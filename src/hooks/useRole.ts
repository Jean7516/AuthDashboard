import { useAuthStore } from '@/store/authStore'

/**
 * Hook central de permisos por rol.
 * Un usuario tiene UN solo rol a la vez.
 */
export function useRole() {
  const { user, permissions } = useAuthStore()

  // Extraer el rol desde los datos del usuario
  const roles: string[] = (user as { roles?: string[] })?.roles ?? []
  const role = roles[0] ?? 'viewer'          // siempre un rol único
  const isSuperAdmin = role === 'superadmin'
  const isAdmin      = role === 'admin'
  const isViewer     = role === 'viewer'

  /** ¿Puede ver una página del sidebar? */
  const canViewPage = (page: 'users' | 'roles' | 'audit' | 'profile' | 'overview') => {
    if (isSuperAdmin) return true
    if (isAdmin)      return true                  // admin ve todo
    // viewer solo overview y profile
    return page === 'overview' || page === 'profile'
  }
  /** ¿Puede modificar usuarios? (crear, editar, eliminar, asignar roles) */
  const canModifyUsers = isSuperAdmin

  /** ¿Puede ver datos de otros usuarios? */
  const canReadUsers   = isSuperAdmin || isAdmin

  /** ¿Puede ver roles y auditoría? */
  const canReadAudit   = isSuperAdmin || isAdmin

  return {
    role,
    isSuperAdmin,
    isAdmin,
    isViewer,
    canViewPage,
    canModifyUsers,
    canReadUsers,
    canReadAudit,
    permissions,
  }
}