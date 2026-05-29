import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/dashboard':         'Overview',
  '/dashboard/users':   'Usuarios',
  '/dashboard/roles':   'Roles',
  '/dashboard/audit':   'Auditoría',
  '/dashboard/profile': 'Configuración',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Dashboard'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-sm font-semibold text-slate-800">{title}</h1>

      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          placeholder="Buscar…"
          className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
          aria-label="Buscar"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="btn-icon relative" aria-label="Notificaciones">
          <Bell size={16} aria-hidden />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden />
        </button>
      </div>
    </header>
  )
}