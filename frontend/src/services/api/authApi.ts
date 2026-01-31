import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface RegisterStudentRequest {
  name: string
  email: string
  password: string
  phone?: string
}

export interface RegisterSpeakerRequest {
  name: string
  email: string
  password: string
  phone?: string
  bio?: string
  expertise?: string[]
  socialLinks?: Record<string, string>
}

export interface GuestSpeakerApplicationRequest {
  name: string
  email: string
  password: string
  phone?: string
  bio: string
  expertise: string[]
  socialLinks?: Record<string, string>
  motivation: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}


export const authApi = {
  // Authentication
  login: (data: LoginRequest) =>
    apiClient.post('/auth/login', data),

  adminLogin: (data: AdminLoginRequest) =>
    apiClient.post('/auth/admin/login', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  // Registration
  registerStudent: (data: RegisterStudentRequest) =>
    apiClient.post('/auth/student/register', data),

  registerSpeaker: (data: RegisterSpeakerRequest) =>
    apiClient.post('/auth/speaker/register', data),

  applyGuestSpeaker: (data: GuestSpeakerApplicationRequest) =>
    apiClient.post('/auth/guest-speaker/apply', data),


  // Password management
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post('/auth/reset-password', data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post('/auth/change-password', data),

  // Profile management
  getProfile: () =>
    apiClient.get('/auth/profile'),

  updateProfile: (data: any) =>
    apiClient.put('/auth/profile', data),

  // Token management
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
}