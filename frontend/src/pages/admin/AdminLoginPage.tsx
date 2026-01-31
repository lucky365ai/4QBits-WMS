import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Shield, Lock } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { adminLogin, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      await adminLogin(data.username, data.password)
      navigate('/admin', { replace: true })
    } catch (error) {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card animate-fade-in">
          <div className="card-header text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="card-title text-red-800">Admin Access</h1>
            <p className="card-description text-red-600">
              Restricted area - authorized personnel only
            </p>
          </div>

          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('username')}
                    type="text"
                    id="username"
                    className="input pl-10"
                    placeholder="Enter admin username"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="form-error">{errors.username.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="input pl-10 pr-10"
                    placeholder="Enter admin password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-error btn-lg w-full"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Access Admin Panel
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This is a secure area. All access attempts are logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage