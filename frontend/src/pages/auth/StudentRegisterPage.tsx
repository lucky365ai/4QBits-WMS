import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Lock, Phone } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

const StudentRegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data, 'student')
      // Redirect to login after successful registration (since we removed email verification)
      navigate('/auth/login', { replace: true })
    } catch (error) {
      // Error is handled by the store
    }
  }

  return (
    <div className="card animate-fade-in">
      <div className="card-header text-center">
        <h1 className="card-title">Student Registration</h1>
        <p className="card-description">Create your account to join workshops</p>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('name')}
                type="text"
                className="input pl-10"
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('email')}
                type="email"
                className="input pl-10"
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('phone')}
                type="tel"
                className="input pl-10"
                placeholder="+1 234 567 8900"
                disabled={isLoading}
              />
            </div>
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input pl-10"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg w-full"
          >
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign In
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Want to teach?{' '}
            <Link to="/auth/speaker/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register as Speaker
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default StudentRegisterPage