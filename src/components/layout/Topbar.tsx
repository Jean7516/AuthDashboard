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
    <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-sm font-semibold text-slate-100">{title}</h1>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
        <input
          type="search"
          placeholder="Buscar…"
          className="w-full h-8 bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
          aria-label="Buscar en el dashboard"
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
