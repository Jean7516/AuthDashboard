import { type LucideIcon } from 'lucide-react'

interface Props { icon: LucideIcon; title: string; description?: string }

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={22} className="text-slate-600" aria-hidden />
      </div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {description && <p className="text-xs text-slate-600 mt-1 max-w-xs">{description}</p>}
    </div>
  )
}
