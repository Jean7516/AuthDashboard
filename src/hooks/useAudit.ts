import { useQuery } from '@tanstack/react-query'
import { auditService } from '@/services/api'
import type { ApiResponse, PageResponse } from '@/types'
import type { AuditLogResponse, DashboardStats } from '@/types/audit'

export function useAuditStats() {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      const res  = await auditService.stats()
      const body = res.data as ApiResponse<DashboardStats>
      return body.data
    },
    refetchInterval: 60_000,   // refresca cada minuto
  })
}

export function useRecentActivity(limit = 8) {
  return useQuery({
    queryKey: ['audit-recent', limit],
    queryFn: async () => {
      const res  = await auditService.recent(limit)
      const body = res.data as ApiResponse<AuditLogResponse[]>
      return body.data
    },
    refetchInterval: 30_000,
  })
}

export function useAuditLogs(page = 0, size = 20, action?: string) {
  return useQuery({
    queryKey: ['audit-logs', page, size, action],
    queryFn: async () => {
      const res  = await auditService.logs(page, size, action)
      const body = res.data as ApiResponse<PageResponse<AuditLogResponse>>
      return body.data
    },
  })
}