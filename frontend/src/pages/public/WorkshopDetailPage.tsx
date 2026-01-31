import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, User, CheckCircle, Share2 } from 'lucide-react'
import { workshopApi, Workshop } from '@/services/api/workshopApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

const WorkshopDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (id) {
      fetchWorkshopDetail(id)
    }
  }, [id])

  const fetchWorkshopDetail = async (workshopId: string) => {
    try {
      setIsLoading(true)
      const response = await workshopApi.getById(workshopId)
      setWorkshop(response.data.workshop)
    } catch (error) {
      console.error('Failed to fetch workshop details:', error)
      toast.error('Failed to load workshop details')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Workshop not found</h2>
        <Link to="/workshops" className="text-primary-600 hover:underline">
          Back to Workshops
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <Link to="/workshops" className="text-sm text-gray-500 hover:text-primary-600 mb-4 inline-block">
            &larr; Back to Workshops
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <span className="badge badge-primary mb-2">{workshop.category.name}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {workshop.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(workshop.startDate).toLocaleDateString()} - {new Date(workshop.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>By {workshop.speaker.name}</span>
                </div>
              </div>

              {workshop.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {workshop.tags.split(',').map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="md:w-1/3">
              <div className="card sticky top-24">
                <div className="card-content">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {workshop.price === 0 ? 'Free' : `$${workshop.price}`}
                  </div>
                  <p className="text-gray-500 mb-6">
                    {workshop.currentRegistrations} already registered
                    {workshop.maxSeats && ` / ${workshop.maxSeats} seats`}
                  </p>

                  {isAuthenticated ? (
                    workshop.maxSeats && workshop.currentRegistrations >= workshop.maxSeats ? (
                      <button
                        onClick={() => {
                          workshopApi.joinWaitlist(workshop.id.toString())
                            .then(() => toast.success('Joined waitlist!'))
                            .catch(() => toast.error('Failed to join waitlist'));
                        }}
                        className="btn btn-warning w-full mb-4"
                      >
                        Join Waitlist
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await workshopApi.register(workshop.id)
                            toast.success('Successfully registered for workshop!')
                            // Refresh workshop data to update seats/status
                            fetchWorkshopDetail(workshop.id.toString())
                          } catch (error: any) {
                            console.error('Registration failed:', error)
                            toast.error(error.response?.data?.message || 'Failed to register')
                          }
                        }}
                        className="btn btn-primary w-full mb-4"
                      >
                        Register Now
                      </button>
                    )
                  ) : (
                    <Link to="/auth/login" className="btn btn-primary w-full mb-4 text-center block">
                      Login to Register
                    </Link>
                  )}

                  <div className="space-y-3">
                    <button className="btn btn-outline w-full flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" /> Share Workshop
                    </button>
                    <a
                      href={workshopApi.getCalendarLink(workshop.id.toString())}
                      className="btn btn-outline w-full flex items-center justify-center gap-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="w-4 h-4" /> Add to Calendar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">About this Workshop</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {workshop.description}
              </p>
            </section>

            {/* Learning Outcomes */}
            {workshop.learningOutcomes && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">What you'll learn</h2>
                <ul className="space-y-3">
                  {workshop.learningOutcomes.split(',').map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-gray-600">{outcome.trim()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements */}
            {workshop.requirements && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Requirements</h2>
                <div className="text-gray-600 whitespace-pre-wrap">
                  {workshop.requirements}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {/* Speaker Bio */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Your Instructor</h2>
              <div className="flex items-center gap-4 mb-4">
                {workshop.speaker.profileImage ? (
                  <img
                    src={workshop.speaker.profileImage}
                    alt={workshop.speaker.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{workshop.speaker.name}</h3>
                  <p className="text-sm text-gray-500">Expert Instructor</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {workshop.speaker.bio || 'No bio available.'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkshopDetailPage