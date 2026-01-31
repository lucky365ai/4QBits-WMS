import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Calendar, ArrowRight } from 'lucide-react'
import { workshopApi, Workshop } from '../../services/api/workshopApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const SpeakerWorkshopsPage = () => {
    const navigate = useNavigate()
    const [workshops, setWorkshops] = useState<Workshop[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchWorkshops()
    }, [])

    const fetchWorkshops = async () => {
        try {
            setIsLoading(true)
            const response = await workshopApi.getSpeakerWorkshops()
            if (response.success) {
                setWorkshops(response.data.workshops)
            }
        } catch (error) {
            console.error('Failed to fetch workshops:', error)
            toast.error('Failed to load workshops')
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Workshops</h1>
                    <p className="text-gray-500 mt-1">Select a workshop to manage sessions and attendance</p>
                </div>
            </div>

            {workshops.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops found</h3>
                    <p className="text-gray-500 mb-6">You haven't been assigned any workshops yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workshops.map((workshop) => (
                        <div key={workshop.id} className="card hover:shadow-lg transition-all">
                            <div className="card-content">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${workshop.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {workshop.status}
                                    </span>
                                    <span className="text-sm font-bold text-primary-600">
                                        {workshop.price === 0 ? 'Free' : `$${workshop.price}`}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                    {workshop.title}
                                </h3>

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(workshop.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{workshop.currentRegistrations} registered</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/dashboard/speaker/workshops/${workshop.id}`)}
                                    className="btn btn-outline w-full flex items-center justify-center gap-2"
                                >
                                    Manage Sessions
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SpeakerWorkshopsPage
