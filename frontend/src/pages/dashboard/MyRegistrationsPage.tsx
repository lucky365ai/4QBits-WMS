import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { dashboardApi, Registration } from '@/services/api/dashboardApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true)
      const response = await dashboardApi.getMyRegistrations()
      setRegistrations(response.data.registrations)
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
      toast.error('Failed to load registrations')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { label: 'Confirmed', color: 'success', icon: CheckCircle },
      PENDING: { label: 'Pending', color: 'warning', icon: AlertCircle },
      CANCELLED: { label: 'Cancelled', color: 'error', icon: XCircle },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`badge badge-${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-2">My Registrations</h2>
        <p className="text-gray-600">View and manage your workshop registrations</p>
      </motion.div>

      {registrations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your learning journey by registering for workshops
            </p>
            <Link to="/workshops" className="btn btn-primary">
              Browse Workshops
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {registrations.map((registration, index) => (
            <motion.div
              key={registration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Link to={`/workshops/${registration.workshop.id}`}>
                <div className="card hover:shadow-strong transition-all cursor-pointer">
                  <div className="card-content">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{registration.workshop.title}</h3>
                            <p className="text-gray-600 line-clamp-2 mb-3">
                              {registration.workshop.description}
                            </p>
                          </div>
                          {getStatusBadge(registration.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(registration.workshop.startDate)} - {formatDate(registration.workshop.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{registration.workshop.speaker.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="badge badge-secondary">
                              {registration.workshop.category.name}
                            </span>
                          </div>
                          {registration.workshop.price > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary-600">
                                ${registration.workshop.price}
                              </span>
                            </div>
                          )}
                        </div>

                        {registration.payment && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              Payment: <span className={`font-semibold ${registration.payment.status === 'COMPLETED' ? 'text-success-600' : 'text-warning-600'}`}>
                                {registration.payment.status}
                              </span>
                              {registration.payment.status === 'COMPLETED' && registration.payment.completedAt && (
                                <span className="text-gray-500 ml-2">
                                  on {formatDate(registration.payment.completedAt)}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyRegistrationsPage
