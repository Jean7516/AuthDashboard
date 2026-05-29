import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import LoadingScreen from '@/components/ui/LoadingScreen'
import type { ApiResponse, AuthResponse } from '@/types'

/**
 * Componente que se ejecuta UNA VEZ al montar la app.
 *
 * Flujo:
 * 1. Lee el refreshToken de sessionStorage.
 * 2. Si existe, llama a /auth/refresh para obtener un nuevo accessToken.
 * 3. Si tiene éxito → restaura la sesión en el store (isAuthenticated = true).
 * 4. Si falla (token expirado o inválido) → limpia sessionStorage y muestra login.
 * 5. Mientras resuelve → muestra LoadingScreen para evitar el flash de login.
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const { login, logout, refreshToken } = useAuthStore()

  useEffect(() => {
    const restore = async () => {
      if (!refreshToken) {
        setChecking(false)
        return
      }

      try {
        const res  = await axios.post('/api/auth/refresh', { refreshToken })
        const body = res.data as ApiResponse<AuthResponse>
        if (body.success) {
          login(body.data)
        } else {
          logout()
        }
      } catch {
        // Token expirado o inválido — limpiar y pedir login
        logout()
      } finally {
        setChecking(false)
      }
    }

    restore()
  // Solo se ejecuta al montar la app, no en cada cambio del store
  }, [])

  if (checking) return <LoadingScreen />

  return <>{children}</>
}