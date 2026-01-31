import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const { state } = JSON.parse(authData)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth data:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError) => {
    const response = error.response

    // Handle different error status codes
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth-storage')
          if (window.location.pathname !== '/auth/login' && !window.location.pathname.startsWith('/admin/login')) {
            window.location.href = '/auth/login'
          }
          break

        case 403:
          // Forbidden
          toast.error('Access denied. You do not have permission to perform this action.')
          break

        case 404:
          // Not found
          if (!response.config?.url?.includes('/auth/')) {
            toast.error('Resource not found')
          }
          break

        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.')
          break

        case 500:
          // Internal server error
          toast.error('Server error. Please try again later.')
          break

        default:
          // Other errors
          const errorMessage = (response.data as any)?.message || 'An unexpected error occurred'
          if (!response.config?.url?.includes('/auth/')) {
            toast.error(errorMessage)
          }
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      toast.error('Request timeout. Please check your connection and try again.')
    } else if (error.message === 'Network Error') {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other errors
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// Helper function to handle file uploads
export const uploadFile = async (
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }

  return apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
}

// Helper function for downloading files
export const downloadFile = async (
  endpoint: string,
  filename?: string
): Promise<void> => {
  try {
    const response = await apiClient.get(endpoint, {
      responseType: 'blob',
    })

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    // Try to get filename from response headers or use provided filename
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    link.setAttribute('download', filename || 'download')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    toast.error('Failed to download file')
    throw error
  }
}

export default apiClient