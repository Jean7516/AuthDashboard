import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

/** Combina clases Tailwind sin conflictos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "hace 2 min", "hace 3 días"… */
export function timeAgo(date: string | null): string {
  if (!date) return '—'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  } catch {
    return '—'
  }
}

/** Formatea fecha como "23 may 2026 · 20:54" */
export function fmtDate(date: string | null): string {
  if (!date) return '—'
  try {
    return format(new Date(date), "d MMM yyyy · HH:mm", { locale: es })
  } catch {
    return '—'
  }
}

/** Iniciales de un email: "juan@…" → "JU" */
export function initials(email: string): string {
  return email.slice(0, 2).toUpperCase()
}

/** Color de avatar determinista por email */
const COLORS = [
  'bg-violet-500/20 text-violet-300',
  'bg-blue-500/20 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-cyan-500/20 text-cyan-300',
]
export function avatarColor(email: string): string {
  const idx = email.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

/** Clase de badge por nombre de rol */
export function roleBadgeClass(role: string): string {
  if (role.includes('superadmin')) return 'badge-superadmin'
  if (role.includes('admin')) return 'badge-admin'
  return 'badge-viewer'
}

/** Nombre legible de un permiso: "users.create" → "users · create" */
export function fmtPermission(perm: string): string {
  return perm.replace('.', ' · ')
}
