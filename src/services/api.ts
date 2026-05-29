import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ── Adjunta Bearer token ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Refresh automático en 401 ────────────────────────────────
let isRefreshing = false
let pendingQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      isRefreshing = true
      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) { useAuthStore.getState().logout(); return Promise.reject(error) }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = data.data.accessToken
        useAuthStore.getState().login(data.data)
        pendingQueue.forEach((p) => p.resolve(newToken))
        pendingQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (e) {
        pendingQueue.forEach((p) => p.reject(e))
        pendingQueue = []
        useAuthStore.getState().logout()
        return Promise.reject(e)
      } finally { isRefreshing = false }
    }
    return Promise.reject(error)
  }
)

// ── Services ─────────────────────────────────────────────────
export const authService = {
  login:    (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout:   (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  register: (payload: { email: string; password: string; username?: string }) =>
    api.post('/auth/register', payload),
}

export const userService = {
  list:           (page = 0, size = 20) =>
    api.get(`/users?page=${page}&size=${size}`),
  me:             () => api.get('/users/me'),
  getById:        (id: string) => api.get(`/users/${id}`),
  delete:         (id: string) => api.delete(`/users/${id}`),
  changePassword: (current: string, next: string) =>
    api.patch('/users/me/password', { currentPassword: current, newPassword: next }),
  assignRole:     (userId: string, roleName: string) =>
    api.post(`/users/${userId}/roles`, { roleName }),
  revokeRole:     (userId: string, roleName: string) =>
    api.delete(`/users/${userId}/roles/${roleName}`),
}

export const auditService = {
  logs:   (page = 0, size = 20, action?: string) =>
    api.get(`/audit/logs?page=${page}&size=${size}${action ? `&action=${action}` : ''}`),
  recent: (limit = 10) =>
    api.get(`/audit/recent?limit=${limit}`),
  stats:  () =>
    api.get('/audit/stats'),
}