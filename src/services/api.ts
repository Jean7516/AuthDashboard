import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = '/api'

/**
 * Instancia base de Axios.
 * Interceptor de request: adjunta el Bearer token en cada llamada.
 * Interceptor de response: maneja 401 intentando refresh automático.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ── Adjunta el access token en cada request ─────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Maneja 401: intenta refresh, si falla hace logout ───────
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

      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = data.data.accessToken
        useAuthStore.getState().login(data.data)
        pendingQueue.forEach((p) => p.resolve(newToken))
        pendingQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        pendingQueue.forEach((p) => p.reject(refreshError))
        pendingQueue = []
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Helpers tipados ─────────────────────────────────────────
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
