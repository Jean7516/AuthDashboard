// ─── Respuesta estándar del API ────────────────────────────
export interface ApiResponse<T> {
  success:   boolean
  message:   string
  data:       T
  timestamp: string
}

export interface PageResponse<T> {
  content:       T[]
  page:          number
  size:          number
  totalElements: number
  totalPages:    number
  first:         boolean
  last:          boolean
}

// ─── Auth ──────────────────────────────────────────────────
export interface AuthResponse {
  accessToken:  string
  refreshToken: string
  tokenType:    string
  expiresAt:    string
  user:         UserResponse
  permissions:  string[]
}

// ─── User ──────────────────────────────────────────────────
export interface UserResponse {
  id:          string
  email:       string
  username:    string | null
  active:      boolean
  verified:    boolean
  lastLoginAt: string | null
  createdAt:   string
  updatedAt:   string
  roles:       string[]
}

// ─── Role ─────────────────────────────────────────────────
export interface RoleResponse {
  id:          string
  name:        string
  displayName: string
  description: string
  system:      boolean
  active:      boolean
  permissions: string[]
}

// ─── Auth State (Zustand) ──────────────────────────────────
export interface AuthState {
  accessToken:  string | null
  refreshToken: string | null
  user:         UserResponse | null
  permissions:  string[]
  isAuthenticated: boolean
  login:  (data: AuthResponse) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}
