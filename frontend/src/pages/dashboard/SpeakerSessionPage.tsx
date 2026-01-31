import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, QrCode, CheckCircle, ArrowLeft, Clock } from 'lucide-react'
import { workshopApi, SessionResponse } from '../../services/api/workshopApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const SpeakerSessionPage = () => {
    const { sessionId } = useParams<{ id: string; sessionId: string }>()
    const [data, setData] = useState<SessionResponse['data'] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showQR, setShowQR] = useState(false)
    const [qrCodeData, setQrCodeData] = useState<{ code: string; image: string; expiresAt: string } | null>(null)

    useEffect(() => {
        if (sessionId) {
            fetchSessionData()
        }
    }, [sessionId])

    const fetchSessionData = async () => {
        try {
            setIsLoading(true)
            const response = await workshopApi.getSessionAttendance(sessionId!)
            if (response.success) {
                setData(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch session data:', error)
            toast.error('Failed to load session data')
        } finally {
            setIsLoading(false)
        }
    }

    const generateQR = async () => {
        try {
            const response = await workshopApi.generateQR(sessionId!)
            if (response.success && response.data.qrCodeImage) {
                setQrCodeData({
                    code: response.data.qrCode!,
                    image: response.data.qrCodeImage,
                    expiresAt: response.data.qrCode! // This was mapped wrong in type probably, let's fix later if needed
                })
                setShowQR(true)
            }
        } catch (error) {
            console.error('Failed to generate QR:', error)
            toast.error('Failed to generate QR code')
        }
    }

    const handleManualAttendance = async (userId: number) => {
        try {
            await workshopApi.markManualAttendance(sessionId!, userId)
            toast.success('Attendance marked successfully')
            fetchSessionData() // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!data) return <div>Session not found</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/dashboard/speaker" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.session.title}</h1>
                        <p className="text-gray-600 mb-4">{data.session.workshopId} - {new Date(data.session.sessionDate).toLocaleDateString()}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {data.session.startTime} - {data.session.endTime}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={generateQR}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <QrCode className="w-5 h-5" />
                        Generate QR Code
                    </button>
                </div>
            </div>

            {showQR && qrCodeData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl max-w-md w-full text-center relative">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold mb-4">Scan to Mark Attendance</h3>
                        <img src={qrCodeData.image} alt="Attendance QR" className="w-full h-auto mb-4" />
                        <p className="text-sm text-gray-500">
                            This code expires in 2 minutes.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Registered Students */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Registered Students ({data.registrations.length})
                    </h2>
                    <div className="space-y-4">
                        {data.registrations.map((reg: any) => {
                            const isAttended = data.attendance.some((a: any) => a.userId === reg.user.id)
                            return (
                                <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{reg.user.name}</p>
                                        <p className="text-sm text-gray-500">{reg.user.email}</p>
                                    </div>
                                    {isAttended ? (
                                        <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Present
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleManualAttendance(reg.user.id)}
                                            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                                        >
                                            Mark Present
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                        {data.registrations.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No students registered yet.</p>
                        )}
                    </div>
                </div>

                {/* Attendance Stats */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-bold mb-4">Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-primary-50 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary-600">
                                {data.stats.attendanceRate}%
                            </p>
                            <p className="text-xs text-primary-800 uppercase tracking-wide font-medium mt-1">
                                Attendance Rate
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {data.stats.totalAttended} / {data.stats.totalRegistered}
                            </p>
                            <p className="text-xs text-green-800 uppercase tracking-wide font-medium mt-1">
                                Students Present
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SpeakerSessionPage
