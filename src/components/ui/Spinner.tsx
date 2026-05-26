import { clsx } from 'clsx'

interface Props { size?: 'sm' | 'md' | 'lg'; className?: string }

export default function Spinner({ size = 'md', className }: Props) {
  return (
    <div
      className={clsx(
        'rounded-full border-2 border-slate-700 border-t-brand-500 animate-spin',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-6 h-6',
        size === 'lg' && 'w-10 h-10',
        className,
      )}
      role="status"
      aria-label="Cargando"
    />
  )
}
