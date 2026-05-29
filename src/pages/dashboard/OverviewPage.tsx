import { Users, ShieldCheck, KeyRound, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import Spinner from "@/components/ui/Spinner";
//import { useUsers } from "@/hooks/useUsers";
import { useAuditStats, useRecentActivity } from "@/hooks/useAudit";
import { timeAgo } from "@/utils";
//import { timeAgo } from '@/utils'

/** Colores de los puntos de actividad según la acción */
function dotColor(action: string): string {
  if (action.includes("login_failed")) return "bg-red-500";
  if (action.includes("login")) return "bg-emerald-500";
  if (action.includes("role")) return "bg-blue-500";
  if (action.includes("password")) return "bg-amber-500";
  if (action.includes("created")) return "bg-emerald-500";
  if (action.includes("deleted")) return "bg-red-400";
  return "bg-slate-400";
}
/*const loginData = [
  { day: "Lun", value: 22 },
  { day: "Mar", value: 28 },
  { day: "Mié", value: 19 },
  { day: "Jue", value: 36 },
  { day: "Vie", value: 25 },
  { day: "Sáb", value: 14 },
  { day: "Dom", value: 18 },
];

const roleData = [
  { name: 'viewer', count: 183, color: '#6366f1' },
  { name: 'admin', count: 58, color: '#6366f1' },
  { name: 'superadmin', count: 6, color: '#6366f1' },
]
  
const ACTIVITY = [
  { dot: 'bg-emerald-500', action: 'user.login', actor: 'juan@empresa.com', time: '2min' },
  { dot: 'bg-blue-500', action: 'role.assigned', actor: 'maria@empresa.com', time: '18min' },
  { dot: 'bg-amber-500', action: 'password.changed', actor: 'pedro@empresa.com', time: '1h' },
  { dot: 'bg-red-500', action: 'user.login_failed', actor: 'unknown@mail.com', time: '2h' },
  { dot: 'bg-emerald-500', action: 'user.created', actor: 'sistema', time: '3h' },
]
*/
export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useAuditStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity(8);

  // Construir loginsByDay: rellenar días sin datos con 0
  const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const rawMap = Object.fromEntries(
    (stats?.loginsByDay ?? []).map((d) => [d.day, d.value]),
  );
  const loginData = DAYS.map((day) => ({ day, value: rawMap[day] ?? 0 }));
  const maxVal = Math.max(...loginData.map((d) => d.value), 1);

  // Distribución de roles
  const roleEntries = Object.entries(stats?.usersByRole ?? {}).sort(
    (a, b) => b[1] - a[1],
  );
  const totalRoleUsers = roleEntries.reduce((s, [, v]) => s + v, 0) || 1;

  const ROLE_COLORS: Record<string, string> = {
    superadmin: "#6415b3",
    admin: "#6366f1",
    viewer: "#93c5fd",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 statscards">
        <StatCard
          label="Usuarios totales"
          value={statsLoading ? "…" : (stats?.totalUsers ?? "—")}
          sub="Total registrados"
          trend="neutral"
          icon={Users}
          iconColor="bg-brand-500 text-brand-50"
        />
        <StatCard
          label="Activos hoy"
          value={statsLoading ? "…" : (stats?.activeToday ?? "—")}
          sub="Logins del día"
          trend="up"
          icon={Activity}
          iconColor="bg-emerald-500 text-emerald-50"
        />
        <StatCard
          label="Logins fallidos"
          value={statsLoading ? "…" : (stats?.failedLoginsToday ?? "—")}
          sub="Intentos hoy"
          trend="down"
          icon={KeyRound}
          iconColor="bg-red-500 text-red-50"
        />
        <StatCard
          label="Tokens activos"
          value={statsLoading ? "…" : (stats?.activeTokens ?? "—")}
          sub="Últimas 24h"
          trend="neutral"
          icon={ShieldCheck}
          iconColor="bg-blue-500 text-blue-50"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Logins por día */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Logins por día
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">Últimos 7 días</p>
            </div>
            <span className="text-xs text-slate-600 font-mono">
              {loginData.reduce((s, d) => s + d.value, 0)} total
            </span>
          </div>
          {statsLoading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={loginData} barSize={24}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#6366f1",
                    border: "1px solid #6366f1",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#ffffff" }}
                  itemStyle={{ color: "#ffffff" }}
                  cursor={{ fill: "rgba(99,102,241,.08)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {loginData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.value === maxVal ? "#6415b3" : "#6366f1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribución de roles */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Distribución de roles
            </h2>
            <p className="text-xs text-slate-700 mt-0.5">
              Por número de usuarios
            </p>
          </div>
          {statsLoading ? (
            <div className="flex items-center justify-center h-24">
              <Spinner />
            </div>
          ) : roleEntries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Sin datos</p>
          ) : (
            <div className="space-y-4">
              {roleEntries.map(([name, count]) => {
                const pct = Math.round((count / totalRoleUsers) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-slate-600 font-mono">
                        {name}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: ROLE_COLORS[name] ?? "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Actividad reciente ─────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Actividad reciente
          </h2>
          <a
            href="/dashboard/audit"
            className="text-xs text-brand-600 hover:text-red-800 transition-colors"
          >
            Ver auditoría →
          </a>
        </div>

        {activityLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : !activity || activity.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Sin actividad registrada
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center gap-4 py-3">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor(a.action)}`}
                  aria-hidden
                />
                <span className="text-xs font-mono text-slate-800 w-40 flex-shrink-0 truncate">
                  {a.action}
                </span>
                <span className="text-xs text-slate-800 flex-1 truncate">
                  {a.actorEmail ?? "sistema"}
                </span>
                <span className="text-xs text-slate-800 tabular-nums whitespace-nowrap">
                  {timeAgo(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
