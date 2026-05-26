import { useState, useMemo } from 'react'
import {
  UserPlus, Download, Search, Trash2, ShieldPlus,
  ChevronUp, ChevronDown, Users,
} from 'lucide-react'
import { useUsers, useDeleteUser } from '@/hooks/useUsers'
import UserModal from '@/components/users/UserModal'
import RoleModal from '@/components/users/RoleModal'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { timeAgo, initials, avatarColor, roleBadgeClass } from '@/utils'
import type { UserResponse } from '@/types'
import { cn } from '@/utils'

type SortField = 'email' | 'createdAt' | 'lastLoginAt'
type SortDir = 'asc' | 'desc'

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [createOpen, setCreateOpen] = useState(false)
  const [roleUser, setRoleUser] = useState<UserResponse | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError } = useUsers(page, 10)
  const deleteUser = useDeleteUser()

  // Filtrado y ordenamiento client-side sobre la página actual
  const rows = useMemo(() => {
    if (!data?.content) return []
    let list = [...data.content]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.username?.toLowerCase().includes(q) ?? false),
      )
    }
    if (roleFilter !== 'all') {
      list = list.filter((u) => u.roles.some((r) => r.includes(roleFilter)))
    }
    if (statusFilter !== 'all') {
      list = list.filter((u) => (statusFilter === 'active' ? u.active : !u.active))
    }

    list.sort((a, b) => {
      let va = a[sortField] ?? ''
      let vb = b[sortField] ?? ''
      if (sortDir === 'asc') return va < vb ? -1 : 1
      return va > vb ? -1 : 1
    })
    return list
  }, [data, search, roleFilter, statusFilter, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc'
        ? <ChevronUp size={13} className="text-brand-400" />
        : <ChevronDown size={13} className="text-brand-400" />
      : <ChevronUp size={13} className="text-slate-700" />

  const handleDelete = async (id: string) => {
    await deleteUser.mutateAsync(id)
    setDeleteId(null)
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Usuarios</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {data?.totalElements ?? '…'} usuarios en el sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost gap-1.5 text-xs">
            <Download size={14} /> Exportar
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="btn-primary text-xs"
          >
            <UserPlus size={14} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Buscar email o username…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="input-base pl-8 h-8 text-xs w-56"
            aria-label="Buscar usuarios"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}
          className="input-base h-8 text-xs w-36"
          aria-label="Filtrar por rol"
        >
          <option value="all">Todos los roles</option>
          <option value="superadmin">superadmin</option>
          <option value="admin">admin</option>
          <option value="viewer">viewer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="input-base h-8 text-xs w-32"
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all') }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Limpiar filtros ×
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={Users}
            title="Error al cargar usuarios"
            description="Verifica la conexión con el backend"
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin resultados"
            description="Intenta cambiar los filtros de búsqueda"
          />
        ) : (
          <table className="w-full text-xs" aria-label="Lista de usuarios">
            <thead>
              <tr className="border-b border-slate-800">
                {[
                  { label: 'Usuario', field: 'email' as SortField },
                  { label: 'Rol', field: null },
                  { label: 'Estado', field: null },
                  { label: 'Último login', field: 'lastLoginAt' as SortField },
                  { label: 'Registrado', field: 'createdAt' as SortField },
                  { label: '', field: null },
                ].map(({ label, field }, i) => (
                  <th
                    key={i}
                    onClick={field ? () => toggleSort(field) : undefined}
                    className={cn(
                      'text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3',
                      field && 'cursor-pointer hover:text-slate-300 select-none',
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {field && <SortIcon field={field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                >
                  {/* Usuario */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                        user.active ? avatarColor(user.email) : 'bg-slate-800 text-slate-600',
                      )}>
                        {initials(user.email)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-200 font-medium truncate">{user.email}</p>
                        {user.username && (
                          <p className="text-slate-600 text-[10px] font-mono">{user.username}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0
                        ? user.roles.map((r) => (
                          <span key={r} className={roleBadgeClass(r)}>{r}</span>
                        ))
                        : <span className="text-slate-600">—</span>
                      }
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span className={user.active ? 'status-active' : 'status-inactive'}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                    {!user.verified && (
                      <span className="ml-1.5 text-[10px] text-amber-500">no verificado</span>
                    )}
                  </td>

                  {/* Último login */}
                  <td className="px-4 py-3 text-slate-500 tabular-nums">
                    {timeAgo(user.lastLoginAt)}
                  </td>

                  {/* Creado */}
                  <td className="px-4 py-3 text-slate-500 tabular-nums">
                    {timeAgo(user.createdAt)}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setRoleUser(user)}
                        className="btn-icon w-7 h-7 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"
                        aria-label={`Asignar rol a ${user.email}`}
                        title="Asignar rol"
                      >
                        <ShieldPlus size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="btn-icon w-7 h-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        aria-label={`Eliminar ${user.email}`}
                        title="Eliminar usuario"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          total={data.totalElements}
          onPage={setPage}
        />
      )}

      {/* Modal crear usuario */}
      <UserModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Modal asignar rol */}
      <RoleModal user={roleUser} onClose={() => setRoleUser(null)} />

      {/* Modal confirmar borrado */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setDeleteId(null)} aria-hidden />
          <div className="relative card p-6 max-w-sm w-full animate-slide-up shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100 mb-1">Eliminar usuario</h2>
            <p className="text-xs text-slate-500 mb-5">
              Esta acción no se puede deshacer. El usuario quedará desactivado y sus sesiones se revocarán.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1 text-xs">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 btn-primary bg-red-600 hover:bg-red-500 text-xs"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
