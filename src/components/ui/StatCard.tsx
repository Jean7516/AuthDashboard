import { type LucideIcon } from 'lucide-react'
import { cn } from '@/utils'

interface Props {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor: string
}

export default function StatCard({ label, value, sub, trend, icon: Icon, iconColor }: Props) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconColor)}>
        <Icon size={18} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
        {sub && (
          <p className={cn(
            'text-xs mt-1',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            trend === 'neutral' && 'text-slate-500',
          )}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
