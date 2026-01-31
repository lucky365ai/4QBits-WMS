import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/api/authApi'
import toast from 'react-hot-toast'

export interface User {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'SPEAKER' | 'STUDENT' | 'GUEST_SPEAKER'
  profileImage?: string
  bio?: string
  expertise?: string[]
  socialLinks?: Record<string, string>
  phone?: string
  isVerified: boolean
  isApproved: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  adminLogin: (username: string, password: string) => Promise<void>
  register: (data: any, type: 'student' | 'speaker' | 'guest-speaker') => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  initializeAuth: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearAuth: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await authApi.login({ email, password })
          
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          toast.success('Login successful!')
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Login failed')
          throw error
        }
      },

      adminLogin: async (username: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await authApi.adminLogin({ username, password })
          
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          toast.success('Admin login successful!')
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Admin login failed')
          throw error
        }
      },

      register: async (data: any, type: 'student' | 'speaker' | 'guest-speaker') => {
        try {
          set({ isLoading: true })
          
          let response
          switch (type) {
            case 'student':
              response = await authApi.registerStudent(data)
              break
            case 'speaker':
              response = await authApi.registerSpeaker(data)
              break
            case 'guest-speaker':
              response = await authApi.applyGuestSpeaker(data)
              break
          }
          
          set({ isLoading: false })
          toast.success(response.data?.message || 'Registration successful!')
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Registration failed')
          throw error
        }
      },

      logout: () => {
        try {
          authApi.logout()
        } catch (error) {
          // Ignore logout errors
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        
        toast.success('Logged out successfully')
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await authApi.updateProfile(data)
          
          set({
            user: response.data.user,
          })
          
          toast.success('Profile updated successfully!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Profile update failed')
          throw error
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await authApi.changePassword({ currentPassword, newPassword })
          toast.success('Password changed successfully!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Password change failed')
          throw error
        }
      },

      initializeAuth: () => {
        const { token, user } = get()
        
        if (token && user) {
          set({ isAuthenticated: true })
        } else {
          set({ isAuthenticated: false })
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)