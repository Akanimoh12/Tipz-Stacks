import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SidebarProvider } from './contexts/SidebarContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Discover from './pages/Discover'
import Leaderboards from './pages/Leaderboards'
import MyProfile from './pages/MyProfile'
import Claim from './pages/Claim'
import RegisterCreator from './pages/RegisterCreator'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <SidebarProvider>
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

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </Router>
  )
}

export default App
