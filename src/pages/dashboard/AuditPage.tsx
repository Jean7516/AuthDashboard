import { useState } from 'react'
import { Download, Search, Filter } from 'lucide-react'
import { fmtDate } from '@/utils'
import { cn } from '@/utils'

const LOGS = [
  { action: 'user.login', actor: 'juan@empresa.com', resource: 'user', ip: '192.168.1.4', time: '2026-05-23T20:54:00Z', type: 'success' },
  { action: 'role.assigned', actor: 'super admin', resource: 'user', ip: '10.0.0.1', time: '2026-05-23T20:36:00Z', type: 'info' },
  { action: 'user.login_failed', actor: 'unknown@mail.com', resource: 'user', ip: '203.0.113.12', time: '2026-05-23T20:18:00Z', type: 'danger' },
  { action: 'password.changed', actor: 'pedro@empresa.com', resource: 'user', ip: '192.168.1.7', time: '2026-05-23T19:50:00Z', type: 'warning' },
  { action: 'user.created', actor: 'sistema', resource: 'user', ip: '10.0.0.1', time: '2026-05-23T18:02:00Z', type: 'success' },
  { action: 'role.revoked', actor: 'super admin', resource: 'user', ip: '10.0.0.1', time: '2026-05-23T17:44:00Z', type: 'info' },
  { action: 'user.login', actor: 'ana@empresa.com', resource: 'user', ip: '192.168.1.9', time: '2026-05-23T17:20:00Z', type: 'success' },
  { action: 'user.deleted', actor: 'super admin', resource: 'user', ip: '10.0.0.1', time: '2026-05-23T16:55:00Z', type: 'danger' },
]

const TYPE_STYLE: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  danger: 'bg-red-500/15 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setAction] = useState('all')
  const [rangeFilter, setRange] = useState('24h')

  const rows = LOGS.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.action.includes(q) || l.actor.toLowerCase().includes(q) || l.ip.includes(q)
    const matchAction = actionFilter === 'all' || l.action === actionFilter
    return matchSearch && matchAction
  })

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Auditoría</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro inmutable de todas las acciones del sistema
          </p>
        </div>
        <button className="btn-ghost text-xs gap-1.5">
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Buscar acción, actor o IP…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-8 h-8 text-xs w-60"
            aria-label="Buscar en auditoría"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setAction(e.target.value)}
          className="input-base h-8 text-xs w-44"
          aria-label="Filtrar por acción"
        >
          <option value="all">Todas las acciones</option>
          <option value="user.login">user.login</option>
          <option value="user.login_failed">user.login_failed</option>
          <option value="user.created">user.created</option>
          <option value="user.deleted">user.deleted</option>
          <option value="role.assigned">role.assigned</option>
          <option value="role.revoked">role.revoked</option>
          <option value="password.changed">password.changed</option>
        </select>
        <select
          value={rangeFilter}
          onChange={(e) => setRange(e.target.value)}
          className="input-base h-8 text-xs w-36"
          aria-label="Rango de fechas"
        >
          <option value="24h">Últimas 24 h</option>
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
        </select>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
          <Filter size={12} />
          {rows.length} resultado{rows.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-xs" aria-label="Registros de auditoría">
          <thead>
            <tr className="border-b border-slate-800">
              {['Acción', 'Actor', 'Recurso', 'IP', 'Fecha y hora'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((log, i) => (
              <tr
                key={i}
                className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors"
              >
                {/* Acción */}
                <td className="px-4 py-3">
                  <span className={cn(
                    'text-[10px] font-mono px-2 py-0.5 rounded border font-medium',
                    TYPE_STYLE[log.type],
                  )}>
                    {log.action}
                  </span>
                </td>

                {/* Actor */}
                <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate">
                  {log.actor}
                </td>

                {/* Recurso */}
                <td className="px-4 py-3">
                  <span className="font-mono text-slate-500">{log.resource}</span>
                </td>

                {/* IP */}
                <td className="px-4 py-3">
                  <span className={cn(
                    'font-mono',
                    log.type === 'danger' ? 'text-red-400' : 'text-slate-500',
                  )}>
                    {log.ip}
                  </span>
                </td>

                {/* Fecha */}
                <td className="px-4 py-3 text-slate-500 tabular-nums whitespace-nowrap">
                  {fmtDate(log.time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-600">
            No hay registros con esos filtros
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-slate-600">Leyenda:</span>
        {Object.entries(TYPE_STYLE).map(([type, cls]) => (
          <span key={type} className={cn('text-[10px] px-2 py-0.5 rounded border font-mono', cls)}>
            {type}
          </span>
        ))}
      </div>
    </div>
  )
}
