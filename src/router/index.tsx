import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useRole } from "@/hooks/useRole";
import { lazy, Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingScreen from "@/components/ui/LoadingScreen";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const OverviewPage = lazy(() => import("@/pages/dashboard/OverviewPage"));
const UsersPage = lazy(() => import("@/pages/dashboard/UsersPage"));
const RolesPage = lazy(() => import("@/pages/dashboard/RolesPage"));
const AuditPage = lazy(() => import("@/pages/dashboard/AuditPage"));
const ProfilePage = lazy(() => import("@/pages/dashboard/ProfilePage"));

const wrap = (el: React.ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{el}</Suspense>
);

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Guard por página: redirige al overview si el rol no tiene acceso */
function PageGuard({
  page,
  children,
}: {
  page: "users" | "roles" | "audit" | "profile" | "overview";
  children: React.ReactNode;
}) {
  const { canViewPage } = useRole();
  if (!canViewPage(page)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  {
    path: "/login",
    element: wrap(
      <PublicRoute>
        <LoginPage />
      </PublicRoute>,
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: wrap(<OverviewPage />) },
      {
        path: "users",
        element: wrap(
          <PageGuard page="users">
            <UsersPage />
          </PageGuard>,
        ),
      },
      {
        path: "roles",
        element: wrap(
          <PageGuard page="roles">
            <RolesPage />
          </PageGuard>,
        ),
      },
      {
        path: "audit",
        element: wrap(
          <PageGuard page="audit">
            <AuditPage />
          </PageGuard>,
        ),
      },
      {
        path: "profile",
        element: wrap(<ProfilePage />),
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
