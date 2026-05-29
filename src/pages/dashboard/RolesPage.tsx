import { ShieldCheck, Crown, Eye, Lock } from 'lucide-react'
import { cn, fmtPermission } from '@/utils'

const ROLES = [
  {
    name: 'superadmin', display: 'Super Administrador', system: true,
    users: 6, icon: Crown, iconClass: 'bg-violet-500 text-violet-50',
    description: 'Acceso total al sistema. Rol protegido, no puede eliminarse.',
    permissions: [
      'users.create', 'users.read', 'users.update', 'users.delete', 'users.manage', 'users.export',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.manage',
      'audit.read', 'audit.export',
      'settings.read', 'settings.update', 'settings.manage',
    ],
  },
  {
    name: 'admin', display: 'Administrador', system: true,
    users: 58, icon: ShieldCheck, iconClass: 'bg-blue-500 text-blue-50',
    description: 'Administración general. Puede crear, leer, actualizar y exportar.',
    permissions: [
      'users.create', 'users.read', 'users.update', 'users.manage', 'users.export',
      'roles.read', 'roles.manage',
      'audit.read',
      'settings.read', 'settings.update',
    ],
  },
  {
    name: 'viewer', display: 'Solo lectura', system: false,
    users: 183, icon: Eye, iconClass: 'bg-green-500 text-slate-50',
    description: 'Solo puede consultar información, sin capacidad de modificar.',
    permissions: [
      'users.read', 'roles.read', 'audit.read', 'settings.read',
    ],
  },
]

const MODULES = ['users', 'roles', 'audit', 'settings']
const ACTIONS = ['create', 'read', 'update', 'delete', 'manage', 'export']

export default function RolesPage() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Roles y permisos</h1>
          <p className="text-xs text-slate-700 mt-0.5">
            3 roles configurados · Los roles de sistema no pueden eliminarse
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <div key={role.name} className="card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', role.iconClass)}>
                <role.icon size={17} aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{role.name}</span>
                  {role.system && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Lock size={9} aria-hidden /> sistema
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-800 mt-0.5">{role.users} usuarios</p>
              </div>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed mb-4">{role.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-slate-900 font-mono border border-slate-700/50"
                >
                  {fmtPermission(p)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Matriz de permisos */}
      <div className="card p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-900">Matriz de permisos</h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Vista completa de qué puede hacer cada rol por módulo
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Matriz de permisos por rol">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-[10px] font-semibold text-slate-700 uppercase tracking-wider pb-3 pr-6">
                  Módulo · Acción
                </th>
                {ROLES.map((r) => (
                  <th
                    key={r.name}
                    className="text-center text-[10px] font-semibold text-slate-800 uppercase tracking-wider pb-3 px-3"
                    colSpan={1}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn('w-5 h-5 rounded-lg flex items-center justify-center', r.iconClass)}>
                        <r.icon size={11} />
                      </span>
                      {r.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.flatMap((mod) =>
                ACTIONS.map((action, ai) => {
                  const perm = `${mod}.${action}`
                  return (
                    <tr
                      key={perm}
                      className={cn(
                        'border-b transition-colors hover:bg-slate-800/30',
                        ai === 0 ? 'border-slate-700' : 'border-slate-800/60',
                      )}
                    >
                      <td className={cn(
                        'py-2 pr-6 font-mono',
                        ai === 0 ? 'text-slate-300 font-medium' : 'text-slate-500',
                      )}>
                        {ai === 0
                          ? <span className="text-red-900">{mod}</span>
                          : <span className="pl-4 text-blue-900">· {action}</span>
                        }
                        {ai !== 0 && (
                          <span className="ml-1 text-slate-800">{action}</span>
                        )}
                        {ai === 0 && (
                          <span className="ml-2 text-slate-800">.{action}</span>
                        )}
                      </td>
                      {ROLES.map((role) => {
                        const has = role.permissions.includes(perm)
                        return (
                          <td key={role.name} className="py-2 px-3 text-center">
                            {has
                              ? <span className="text-emerald-800 text-base leading-none" aria-label="permitido">✓</span>
                              : <span className="text-slate-900 text-base leading-none" aria-label="no permitido">—</span>
                            }
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
