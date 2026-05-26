import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/api'
import type { ApiResponse, PageResponse, UserResponse } from '@/types'

export const USERS_KEY = 'users'

export function useUsers(page = 0, size = 10) {
  return useQuery({
    queryKey: [USERS_KEY, page, size],
    queryFn: async () => {
      const res = await userService.list(page, size)
      const body = res.data as ApiResponse<PageResponse<UserResponse>>
      return body.data
    },
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await userService.me()
      const body = res.data as ApiResponse<UserResponse>
      return body.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export function useAssignRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      userService.assignRole(userId, roleName),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export function useRevokeRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      userService.revokeRole(userId, roleName),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      userService.changePassword(current, next),
  })
}

