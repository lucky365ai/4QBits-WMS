import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

// Layouts - Keep these as regular imports for faster initial load
import PublicLayout from '@/layouts/PublicLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import AdminLayout from '@/layouts/AdminLayout'

// Components
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// Lazy load pages for better code splitting
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const WorkshopsPage = lazy(() => import('@/pages/public/WorkshopsPage'))
const WorkshopDetailPage = lazy(() => import('@/pages/public/WorkshopDetailPage'))
const CertificateVerificationPage = lazy(() => import('@/pages/public/CertificateVerificationPage'))

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const StudentRegisterPage = lazy(() => import('@/pages/auth/StudentRegisterPage'))
const SpeakerRegisterPage = lazy(() => import('@/pages/auth/SpeakerRegisterPage'))
const GuestSpeakerApplyPage = lazy(() => import('@/pages/auth/GuestSpeakerApplyPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

const StudentDashboard = lazy(() => import('@/pages/dashboard/StudentDashboard'))
const SpeakerDashboard = lazy(() => import('@/pages/dashboard/SpeakerDashboard'))
const SpeakerWorkshopsPage = lazy(() => import('@/pages/dashboard/SpeakerWorkshopsPage'))
const SpeakerWorkshopManagePage = lazy(() => import('@/pages/dashboard/SpeakerWorkshopManagePage'))
const SpeakerSessionPage = lazy(() => import('@/pages/dashboard/SpeakerSessionPage'))
const MyRegistrationsPage = lazy(() => import('@/pages/dashboard/MyRegistrationsPage'))
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'))
const AttendancePage = lazy(() => import('@/pages/dashboard/AttendancePage'))
const CertificatesPage = lazy(() => import('@/pages/dashboard/CertificatesPage'))

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminWorkshopsPage = lazy(() => import('@/pages/admin/AdminWorkshopsPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'))
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AdminAuditLogsPage'))
const AdminCreateWorkshopPage = lazy(() => import('@/pages/admin/AdminCreateWorkshopPage'))

// Suspense fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

function App() {
  const { user, isLoading, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="workshops" element={<WorkshopsPage />} />
            <Route path="workshops/:id" element={<WorkshopDetailPage />} />
            <Route path="verify-certificate" element={<CertificateVerificationPage />} />
          </Route>

          {/* Authentication Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="student/register" element={<StudentRegisterPage />} />
            <Route path="speaker/register" element={<SpeakerRegisterPage />} />
            <Route path="guest-speaker/apply" element={<GuestSpeakerApplyPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Hidden Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'SPEAKER', 'GUEST_SPEAKER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  {user?.role === 'STUDENT' ? (
                    <StudentDashboard />
                  ) : (
                    <SpeakerDashboard />
                  )}
                </Suspense>
              }
            />
            <Route path="registrations" element={<MyRegistrationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="certificates" element={<CertificatesPage />} />

            {/* Speaker Routes */}
            <Route path="speaker/workshops" element={<SpeakerWorkshopsPage />} />
            <Route path="speaker/workshops/:id" element={<SpeakerWorkshopManagePage />} />
            <Route path="speaker/workshops/:id/sessions/:sessionId" element={<SpeakerSessionPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="workshops" element={<AdminWorkshopsPage />} />
            <Route path="workshops/create" element={<AdminCreateWorkshopPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Redirect based on user role */}
          <Route
            path="/app"
            element={
              user ? (
                user.role === 'ADMIN' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/auth/login" replace />
              )
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App