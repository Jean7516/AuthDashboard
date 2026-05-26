import { Users, ShieldCheck, KeyRound, Activity } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import StatCard from '@/components/ui/StatCard'
import { useUsers } from '@/hooks/useUsers'
import { timeAgo } from '@/utils'

const loginData = [
  { day: 'Lun', value: 22 },
  { day: 'Mar', value: 28 },
  { day: 'Mié', value: 19 },
  { day: 'Jue', value: 36 },
  { day: 'Vie', value: 25 },
  { day: 'Sáb', value: 14 },
  { day: 'Dom', value: 18 },
]

const roleData = [
  { name: 'viewer', count: 183, color: '#64748b' },
  { name: 'admin', count: 58, color: '#6366f1' },
  { name: 'superadmin', count: 6, color: '#8b5cf6' },
]

const ACTIVITY = [
  { dot: 'bg-emerald-500', action: 'user.login', actor: 'juan@empresa.com', time: '2min' },
  { dot: 'bg-blue-500', action: 'role.assigned', actor: 'maria@empresa.com', time: '18min' },
  { dot: 'bg-amber-500', action: 'password.changed', actor: 'pedro@empresa.com', time: '1h' },
  { dot: 'bg-red-500', action: 'user.login_failed', actor: 'unknown@mail.com', time: '2h' },
  { dot: 'bg-emerald-500', action: 'user.created', actor: 'sistema', time: '3h' },
]

export default function OverviewPage() {
  const { data } = useUsers(0, 1)
  const totalUsers = data?.totalElements ?? '—'

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Usuarios totales"
          value={totalUsers}
          sub="↑ +12 este mes"
          trend="up"
          icon={Users}
          iconColor="bg-brand-500/15 text-brand-400"
        />
        <StatCard
          label="Activos hoy"
          value={38}
          sub="↑ +5 vs ayer"
          trend="up"
          icon={Activity}
          iconColor="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Logins fallidos"
          value={14}
          sub="↑ +3 vs ayer"
          trend="down"
          icon={KeyRound}
          iconColor="bg-red-500/15 text-red-400"
        />
        <StatCard
          label="Tokens activos"
          value={91}
          sub="refresh tokens"
          trend="neutral"
          icon={ShieldCheck}
          iconColor="bg-violet-500/15 text-violet-400"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Logins por día */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Logins por día</h2>
              <p className="text-xs text-slate-500 mt-0.5">Últimos 7 días</p>
            </div>
            <span className="text-xs text-slate-600 font-mono">162 total</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={loginData} barSize={24}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#818cf8' }}
                cursor={{ fill: 'rgba(99,102,241,.08)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {loginData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.day === 'Jue' ? '#6366f1' : '#334155'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de roles */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-100">Distribución de roles</h2>
            <p className="text-xs text-slate-500 mt-0.5">Por número de usuarios</p>
          </div>
          <div className="space-y-4">
            {roleData.map((r) => {
              const pct = Math.round((r.count / 247) * 100)
              return (
                <div key={r.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400 font-mono">{r.name}</span>
                    <span className="text-xs font-semibold text-slate-200 tabular-nums">
                      {r.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: r.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-100">Actividad reciente</h2>
          <a
            href="/dashboard/audit"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Ver auditoría →
          </a>
        </div>
        <div className="space-y-0 divide-y divide-slate-800">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} aria-hidden />
              <span className="text-xs font-mono text-slate-300 w-36 flex-shrink-0">
                {a.action}
              </span>
              <span className="text-xs text-slate-500 flex-1 truncate">{a.actor}</span>
              <span className="text-xs text-slate-600 tabular-nums">hace {a.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
