import { create } from 'zustand'
import type { AuthState, AuthResponse } from '@/types'

/**
 * Store de autenticación con Zustand.
 *
 * accessToken se guarda en memoria (no localStorage) para evitar XSS.
 * refreshToken en sessionStorage para sobrevivir recargas sin riesgo de
 * persistencia entre sesiones del navegador.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken:     null,
  refreshToken:    sessionStorage.getItem('refresh_token'),
  user:            null,
  permissions:     [],
  isAuthenticated: false,

  login: (data: AuthResponse) => {
    sessionStorage.setItem('refresh_token', data.refreshToken)
    set({
      accessToken:     data.accessToken,
      refreshToken:    data.refreshToken,
      user:            data.user,
      permissions:     data.permissions,
      isAuthenticated: true,
    })
  },

  logout: () => {
    sessionStorage.removeItem('refresh_token')
    set({
      accessToken:     null,
      refreshToken:    null,
      user:            null,
      permissions:     [],
      isAuthenticated: false,
    })
  },

  hasPermission: (permission: string) => {
    return get().permissions.includes(permission)
  },
}))
