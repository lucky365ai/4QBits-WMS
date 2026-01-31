import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Award, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import { dashboardApi, DashboardStats } from '@/services/api/dashboardApi'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await dashboardApi.getStats('STUDENT')
      setStats(response.data.overview)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Registered Workshops',
      value: stats?.registeredWorkshops || 0,
      icon: BookOpen,
      color: 'primary',
      link: '/dashboard/registrations',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: Award,
      color: 'success',
      link: '/dashboard/certificates',
    },
    {
      title: 'Certificates',
      value: stats?.certificates || 0,
      icon: TrendingUp,
      color: 'warning',
      link: '/dashboard/certificates',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
        </h2>
        <p className="text-gray-600">Here's your learning overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Link to={card.link} className="block">
              <div className="card hover:shadow-strong transition-all cursor-pointer h-full">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${card.color}-100 flex items-center justify-center`}>
                      <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                    </div>
                    <ArrowRight className={`w-5 h-5 text-${card.color}-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                  <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Quick Actions
            </h3>
          </div>
          <div className="card-content space-y-3">
            <Link
              to="/workshops"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Browse Workshops</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/dashboard/registrations"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">My Registrations</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/dashboard/certificates"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">View Certificates</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Learning Progress
            </h3>
          </div>
          <div className="card-content">
            {stats?.registeredWorkshops === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">You haven't registered for any workshops yet</p>
                <Link to="/workshops" className="btn btn-primary">
                  Browse Workshops
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold">
                      {stats?.registeredWorkshops
                        ? Math.round(((stats.completed || 0) / stats.registeredWorkshops) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-primary-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: stats?.registeredWorkshops
                          ? `${((stats.completed || 0) / stats.registeredWorkshops) * 100}%`
                          : '0%',
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Keep learning! {stats?.completed || 0} of {stats?.registeredWorkshops || 0} workshops completed.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StudentDashboard
