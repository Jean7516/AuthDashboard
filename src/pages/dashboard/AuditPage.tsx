import { useState } from 'react'
import { Download, Search, Filter } from 'lucide-react'
import { fmtDate } from '@/utils'
import { cn } from '@/utils'
import { useAuditLogs } from '@/hooks/useAudit'
import Spinner    from '@/components/ui/Spinner'
import Pagination from '@/components/ui/Pagination'
import type { AuditLogResponse } from '@/types/audit'

// ─── Determina el tipo visual según la acción ─────────────────
function logType(action: string): string {
  if (action.includes('login_failed') || action.includes('deleted')) return 'danger'
  if (action.includes('login') || action.includes('created'))        return 'success'
  if (action.includes('password'))                                    return 'warning'
  return 'info'
}

const TYPE_STYLE: Record<string, string> = {
  success: 'bg-emerald-500 text-emerald-50 border-emerald-500/20',
  danger:  'bg-red-500     text-red-50     border-red-500/20',
  warning: 'bg-amber-500   text-amber-50   border-amber-500/20',
  info:    'bg-blue-500    text-blue-50    border-blue-500/20',
}

export default function AuditPage() {
  const [search,      setSearch]  = useState('')
  const [actionFilter, setAction] = useState('')
  const [page,         setPage]   = useState(0)

  const { data, isLoading, isError } = useAuditLogs(page, 20, actionFilter || undefined)

  // Filtrado client-side por búsqueda de texto (actor, IP)
  const rows: AuditLogResponse[] = (data?.content ?? []).filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.action.includes(q) ||
      (l.actorEmail?.toLowerCase().includes(q) ?? false) ||
      (l.resourceType?.includes(q) ?? false)
    )
  })

  // Exportar CSV con los datos actuales
  const exportCsv = () => {
    if (!data?.content.length) return
    const headers = ['Acción', 'Actor', 'Recurso', 'ID Recurso', 'Fecha']
    const csvRows = data.content.map((l) => [
      l.action,
      l.actorEmail ?? 'sistema',
      l.resourceType ?? '—',
      l.resourceId   ?? '—',
      fmtDate(l.createdAt),
    ])
    const csv = [headers, ...csvRows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Auditoría</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro inmutable de todas las acciones del sistema
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data?.content.length}
          className="btn-ghost text-xs gap-1.5 disabled:opacity-40"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar acción o actor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-8 h-8 text-xs w-60"
            aria-label="Buscar en auditoría"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => { setAction(e.target.value); setPage(0) }}
          className="input-base h-8 text-xs w-44"
          aria-label="Filtrar por acción"
        >
          <option value="">Todas las acciones</option>
          <option value="user.login">user.login</option>
          <option value="user.login_failed">user.login_failed</option>
          <option value="user.created">user.created</option>
          <option value="user.deleted">user.deleted</option>
          <option value="role.assigned">role.assigned</option>
          <option value="role.revoked">role.revoked</option>
          <option value="password.changed">password.changed</option>
        </select>

        {(search || actionFilter) && (
          <button
            onClick={() => { setSearch(''); setAction(''); setPage(0) }}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            Limpiar ×
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto">
          <Filter size={12} />
          {isLoading ? '…' : `${data?.totalElements ?? 0} registros`}
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-sm text-red-500">
            Error al cargar los registros de auditoría
          </div>
        ) : (
          <table className="w-full text-xs" aria-label="Registros de auditoría">
            <thead>
              <tr className="border-b border-slate-100">
                {['Acción', 'Actor', 'Recurso', 'ID Recurso', 'Fecha y hora'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                    No hay registros con esos filtros
                  </td>
                </tr>
              ) : (
                rows.map((log) => {
                  const type = logType(log.action)
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      {/* Acción */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded border font-medium',
                          TYPE_STYLE[type],
                        )}>
                          {log.action}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                        {log.actorEmail ?? 'sistema'}
                      </td>

                      {/* Recurso */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-500">
                          {log.resourceType ?? '—'}
                        </span>
                      </td>

                      {/* ID recurso */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-400 text-[10px]">
                          {log.resourceId
                            ? `${log.resourceId.slice(0, 8)}…`
                            : '—'}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-slate-500 tabular-nums whitespace-nowrap">
                        {fmtDate(log.createdAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          total={data.totalElements}
          onPage={setPage}
        />
      )}

      {/* Leyenda */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-400">Leyenda:</span>
        {Object.entries(TYPE_STYLE).map(([type, cls]) => (
          <span
            key={type}
            className={cn('text-[10px] px-2 py-0.5 rounded border font-mono', cls)}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  )
}