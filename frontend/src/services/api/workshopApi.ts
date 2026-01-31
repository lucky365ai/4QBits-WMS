import { apiClient } from './client'

export interface Workshop {
    id: number
    title: string
    description: string
    categoryId: number
    speakerId: number
    price: number
    maxSeats: number | null
    currentRegistrations: number
    startDate: string
    endDate: string
    bannerImage: string | null
    status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
    tags: string | null
    requirements: string | null
    learningOutcomes: string | null
    category: {
        id: number
        name: string
        slug: string
    }
    speaker: {
        id: number
        name: string
        bio: string | null
        profileImage: string | null
    }
    _count?: {
        registrations: number
        feedback: number
    }
    averageRating?: number
}

export interface WorkshopsResponse {
    success: boolean
    data: {
        workshops: Workshop[]
        pagination: {
            page: number
            limit: number
            total: number
            pages: number
        }
    }
}

export interface Session {
    id: number
    title: string
    description: string | null
    sessionDate: string
    startTime: string
    endTime: string
    qrCode?: string
    qrExpiresAt?: string
    workshopId: number
}

export interface SessionResponse {
    success: boolean
    data: {
        session: Session
        attendance: any[]
        registrations: any[]
        stats: any
        qrCode?: string
        qrCodeImage?: string
    }
}

export interface WorkshopDetailResponse {
    success: boolean
    data: {
        workshop: Workshop & {
            sessions: any[]
            files: any[]
            feedback: any[]
        }
    }
}

export const workshopApi = {
    getAll: (params?: any) => apiClient.get<WorkshopsResponse>('/workshops', { params }) as unknown as Promise<WorkshopsResponse>,
    getById: (id: number | string) => apiClient.get<WorkshopDetailResponse>(`/workshops/${id}`) as unknown as Promise<WorkshopDetailResponse>,

    // Admin
    create: (data: any) => apiClient.post<Workshop>('/workshops', data) as unknown as Promise<Workshop>,
    update: (id: number | string, data: any) => apiClient.put<Workshop>(`/workshops/${id}`, data) as unknown as Promise<Workshop>,
    delete: (id: number | string) => apiClient.delete(`/workshops/${id}`),

    // Waitlist & Registration
    register: (id: number | string) => apiClient.post(`/workshops/${id}/register`),
    joinWaitlist: (id: string) => apiClient.post(`/workshops/${id}/waitlist`),
    leaveWaitlist: (id: string) => apiClient.delete(`/workshops/${id}/waitlist`),
    // Speaker
    getSpeakerWorkshops: (speakerId?: number | string) => apiClient.get<WorkshopsResponse>(`/workshops/speaker${speakerId ? `/${speakerId}` : ''}`) as unknown as Promise<WorkshopsResponse>,

    // Session Management for Speakers
    getSessions: (workshopId: number | string) => apiClient.get<any>(`/workshops/${workshopId}`), // We can get sessions from workshop detail
    getSessionAttendance: (sessionId: number | string) => apiClient.get<SessionResponse>(`/workshops/sessions/${sessionId}/attendance`) as unknown as Promise<SessionResponse>,
    generateQR: (sessionId: number | string) => apiClient.post<SessionResponse>(`/workshops/sessions/${sessionId}/qr`) as unknown as Promise<SessionResponse>,
    markManualAttendance: (sessionId: number | string, userId: number | string) => apiClient.post(`/workshops/sessions/${sessionId}/attendance`, { userId }),

    // Calendar
    getCalendarLink: (id: string) => `/api/workshops/${id}/calendar`,
}
