import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { lazy, Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingScreen from '@/components/ui/LoadingScreen'

// Lazy loading de páginas — mejor performance inicial
const LoginPage     = lazy(() => import('@/pages/auth/LoginPage'))
const OverviewPage  = lazy(() => import('@/pages/dashboard/OverviewPage'))
const UsersPage     = lazy(() => import('@/pages/dashboard/UsersPage'))
const RolesPage     = lazy(() => import('@/pages/dashboard/RolesPage'))
const AuditPage     = lazy(() => import('@/pages/dashboard/AuditPage'))
const ProfilePage   = lazy(() => import('@/pages/dashboard/ProfilePage'))

/** Guard: redirige al login si no está autenticado */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Guard: si ya está autenticado, redirige al dashboard */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const wrap = (el: React.ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{el}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: wrap(<PublicRoute><LoginPage /></PublicRoute>),
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true,          element: wrap(<OverviewPage />) },
      { path: 'users',        element: wrap(<UsersPage />)    },
      { path: 'roles',        element: wrap(<RolesPage />)    },
      { path: 'audit',        element: wrap(<AuditPage />)    },
      { path: 'profile',      element: wrap(<ProfilePage />)  },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
