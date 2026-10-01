/**
 * App.tsx — Top-level application router and providers.
 * Wires: React Query + AuthProvider + BrowserRouter + RouteGuard + AppShell.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import { RouteGuard } from '@/auth/RouteGuard';
import { RoleGuard } from '@/auth/RoleGuard';
import { AppShell } from '@/shell/AppShell';

import { LoginPage } from '@/pages/LoginPage';
import { PublicPage } from '@/pages/PublicPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NodesPage } from '@/pages/NodesPage';
import { NodeDetailPage } from '@/pages/NodeDetailPage';
import { IncidentsPage } from '@/pages/IncidentsPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { MapPage } from '@/pages/MapPage';
import { AssignmentsPage } from '@/pages/AssignmentsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { OperationsPage } from '@/pages/OperationsPage';
import { SafeZonesPage } from '@/pages/SafeZonesPage';
import { AdminPage } from '@/pages/AdminPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/public" element={<PublicPage />} />

            {/* Authenticated operational routes */}
            <Route element={<RouteGuard />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/nodes" element={<NodesPage />} />
                <Route path="/nodes/:nodeId" element={<NodeDetailPage />} />
                <Route
                  path="/incidents"
                  element={
                    <RoleGuard roles={['ADMIN', 'AUTHORITY', 'WORKER']}>
                      <IncidentsPage />
                    </RoleGuard>
                  }
                />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route
                  path="/assignments"
                  element={
                    <RoleGuard roles={['WORKER']}>
                      <AssignmentsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <RoleGuard roles={['WORKER', 'AUTHORITY', 'ADMIN']}>
                      <ReportsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/operations"
                  element={
                    <RoleGuard roles={['AUTHORITY', 'ADMIN']}>
                      <OperationsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/safe-zones"
                  element={
                    <RoleGuard roles={['CITIZEN', 'WORKER', 'AUTHORITY']}>
                      <SafeZonesPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RoleGuard roles={['ADMIN']}>
                      <AdminPage />
                    </RoleGuard>
                  }
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
