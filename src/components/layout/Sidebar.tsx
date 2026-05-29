import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShieldHalf,
  FileText, Settings, ShieldCheck, LogOut,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { useRole }      from '@/hooks/useRole'
import { authService }  from '@/services/api'

const NAV = [
  { label: 'Overview',  to: '/dashboard',         icon: LayoutDashboard, page: 'overview' as const, end: true },
  { label: 'Usuarios',  to: '/dashboard/users',   icon: Users,           page: 'users'    as const           },
  { label: 'Roles',     to: '/dashboard/roles',   icon: ShieldHalf,      page: 'roles'    as const           },
  { label: 'Auditoría', to: '/dashboard/audit',   icon: FileText,        page: 'audit'    as const           },
  { label: 'Perfil',    to: '/dashboard/profile', icon: Settings,        page: 'profile'  as const           },
]

const ROLE_BADGE: Record<string, string> = {
  superadmin: 'bg-violet-100 text-violet-700',
  admin:      'bg-blue-100   text-blue-700',
  viewer:     'bg-slate-100  text-slate-500',
}

export default function Sidebar() {
  const { user, logout, refreshToken } = useAuthStore()
  const { canViewPage, role }          = useRole()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { if (refreshToken) await authService.logout(refreshToken) }
    finally { logout(); navigate('/login') }
  }

  const initials     = user?.email ? user.email.slice(0, 2).toUpperCase() : 'AU'
  const displayName  = user?.username ?? user?.email?.split('@')[0] ?? '—'
  const badgeClass   = ROLE_BADGE[role] ?? ROLE_BADGE.viewer

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">

      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-slate-200">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <ShieldCheck size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-none">AuthServer</p>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">admin panel</p>
        </div>
      </div>

      {/* Nav — solo muestra páginas permitidas para el rol */}
      <nav className="flex-1 py-4 px-3" aria-label="Menú principal">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          navegación
        </p>
        <ul className="space-y-0.5">
          {NAV.filter(({ page }) => canViewPage(page)).map(({ label, to, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                <Icon size={16} aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: usuario + rol */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 px-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', badgeClass)}>
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-1.5 mt-1 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut size={13} aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}


