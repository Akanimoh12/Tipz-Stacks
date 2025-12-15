import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SidebarProvider } from './contexts/SidebarContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'
import { ReferralBanner } from './components/social'
import ErrorBoundary from './components/common/ErrorBoundary'
import { LoadingFallback } from './components/common/LoadingFallback'

// Lazy load all page components for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Discover = lazy(() => import('./pages/Discover'))
const Leaderboards = lazy(() => import('./pages/Leaderboards'))
const MyProfile = lazy(() => import('./pages/MyProfile'))
const Claim = lazy(() => import('./pages/Claim'))
const RegisterCreator = lazy(() => import('./pages/RegisterCreator'))
const CreatorProfile = lazy(() => import('./pages/CreatorProfile'))
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'))
const TipperProfile = lazy(() => import('./pages/TipperProfile'))
const Achievements = lazy(() => import('./pages/Achievements').then(module => ({ default: module.Achievements })))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <SidebarProvider>
          <ReferralBanner />
          <Suspense fallback={<LoadingFallback fullScreen message="Loading Tipz..." />}>
            <Routes>
              {/* Public Route */}
              <Route path="/" element={<Landing />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Discover />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboards"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Leaderboards />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/claim"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Claim />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-creator"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RegisterCreator />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/:address"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreatorProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tipper/:address"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TipperProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TransactionHistory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Achievements />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </SidebarProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
