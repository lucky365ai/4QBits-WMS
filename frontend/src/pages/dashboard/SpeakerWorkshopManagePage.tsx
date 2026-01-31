import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, Users, ArrowRight, ArrowLeft } from 'lucide-react'
import { workshopApi, Workshop } from '../../services/api/workshopApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const SpeakerWorkshopManagePage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [workshop, setWorkshop] = useState<(Workshop & { sessions: any[] }) | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchWorkshop()
        }
    }, [id])

    const fetchWorkshop = async () => {
        try {
            setIsLoading(true)
            const response = await workshopApi.getById(id!)
            if (response.success) {
                setWorkshop(response.data.workshop)
            }
        } catch (error) {
            console.error('Failed to fetch workshop:', error)
            toast.error('Failed to load workshop details')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!workshop) return <div>Workshop not found</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/dashboard/speaker/workshops" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Workshops
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{workshop.title}</h1>
                    <p className="text-gray-500 mt-1">Manage Sessions & Attendance</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Sessions
                </h2>

                {workshop.sessions && workshop.sessions.length > 0 ? (
                    <div className="space-y-4">
                        {workshop.sessions.map((session: any) => (
                            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary-300 transition-colors">
                                <div>
                                    <h3 className="font-bold text-gray-900">{session.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(session.sessionDate).toLocaleDateString()} • {session.startTime} - {session.endTime}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/dashboard/speaker/workshops/${workshop.id}/sessions/${session.id}`)}
                                    className="btn btn-outline flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Manage Attendance
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No sessions found for this workshop.
                    </div>
                )}
            </div>
        </div>
    )
}

export default SpeakerWorkshopManagePage
