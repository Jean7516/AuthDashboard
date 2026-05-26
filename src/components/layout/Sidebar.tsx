import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShieldHalf, FileText,
  Settings, ShieldCheck, LogOut
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api'

const NAV = [
  { label: 'Overview',   to: '/dashboard',         icon: LayoutDashboard, end: true },
  { label: 'Usuarios',   to: '/dashboard/users',   icon: Users            },
  { label: 'Roles',      to: '/dashboard/roles',   icon: ShieldHalf       },
  { label: 'Auditoría',  to: '/dashboard/audit',   icon: FileText         },
  { label: 'Perfil',     to: '/dashboard/profile', icon: Settings         },
]

export default function Sidebar() {
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'AU'

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <ShieldCheck size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100 leading-none">AuthServer</p>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">admin panel</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4 px-3" aria-label="Menú principal">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
          navegación
        </p>
        <ul className="space-y-0.5">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-brand-600/20 text-brand-400 font-medium'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
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

      {/* Footer usuario */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-semibold text-brand-400 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.username ?? user?.email}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={13} aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
