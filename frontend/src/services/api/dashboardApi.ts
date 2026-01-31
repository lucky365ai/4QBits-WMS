import { apiClient } from './client'

export interface DashboardStats {
  totalUsers?: number
  totalWorkshops?: number
  totalRegistrations?: number
  totalRevenue?: number
  myWorkshops?: number
  totalStudents?: number
  averageRating?: number
  registeredWorkshops?: number
  completed?: number
  certificates?: number
}

export interface DashboardResponse {
  success: boolean
  data: {
    overview: DashboardStats
    recentActivity?: any[]
    popularWorkshops?: any[]
    monthlyTrends?: any[]
  }
}

export interface Registration {
  id: number
  status: string
  registeredAt: string
  workshop: {
    id: number
    title: string
    description: string
    startDate: string
    endDate: string
    price: number
    category: {
      name: string
      slug: string
    }
    speaker: {
      name: string
      profileImage: string | null
    }
    sessions: any[]
  }
  payment?: {
    id: number
    amount: number
    status: string
    completedAt: string | null
  }
  attendance?: any[]
}

export interface RegistrationsResponse {
  success: boolean
  data: {
    registrations: Registration[]
  }
}

export const dashboardApi = {
  // Get dashboard stats based on user role
  getStats: (role: string) => {
    if (role === 'ADMIN') {
      return apiClient.get<DashboardResponse>('/admin/analytics/dashboard') as unknown as Promise<DashboardResponse>
    } else if (role === 'SPEAKER' || role === 'GUEST_SPEAKER') {
      return apiClient.get<DashboardResponse>('/users/speaker/stats') as unknown as Promise<DashboardResponse>
    } else {
      return apiClient.get<DashboardResponse>('/users/student/stats') as unknown as Promise<DashboardResponse>
    }
  },
  
  // Get user registrations
  getMyRegistrations: () => {
    return apiClient.get<RegistrationsResponse>('/registrations/my-registrations') as unknown as Promise<RegistrationsResponse>
  },
  
  // Get speaker workshops
  getMyWorkshops: () => {
    return apiClient.get('/workshops/my-workshops') as unknown as Promise<any>
  },

  // Detailed Analytics
  getRevenueAnalytics: (period = '12m') => apiClient.get(`/admin/analytics/revenue?period=${period}`),
  getUserEngagement: () => apiClient.get('/admin/analytics/engagement'),
  exportAnalytics: (type: string, format = 'json') => apiClient.get(`/admin/analytics/export?type=${type}&format=${format}`),
}
