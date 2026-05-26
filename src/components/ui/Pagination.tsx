import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils'

interface Props {
  page: number
  totalPages: number
  total: number
  onPage: (p: number) => void
}

export default function Pagination({ page, totalPages, total, onPage }: Props) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i)

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-xs text-slate-500 tabular-nums">
        {total} registro{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="btn-icon w-7 h-7 disabled:opacity-30"
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'w-7 h-7 rounded-lg text-xs font-medium transition-all',
              p === page
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
            )}
          >
            {p + 1}
          </button>
        ))}
        {totalPages > 5 && <span className="text-slate-600 text-xs px-1">…</span>}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages - 1}
          className="btn-icon w-7 h-7 disabled:opacity-30"
          aria-label="Página siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
