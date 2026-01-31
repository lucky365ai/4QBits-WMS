import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Users, Star, ArrowRight, Plus } from 'lucide-react'
import { dashboardApi, DashboardStats } from '@/services/api/dashboardApi'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const SpeakerDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await dashboardApi.getStats(user?.role || 'SPEAKER')
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
      title: 'My Workshops',
      value: stats?.myWorkshops || 0,
      icon: BookOpen,
      color: 'primary',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'success',
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'warning',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Speaker'}! 👋
          </h2>
          <p className="text-gray-600">Manage your workshops and track your impact</p>
        </div>
        <Link to="/admin/workshops/create" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Workshop
        </Link>
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
            <div className="card hover:shadow-strong transition-all h-full">
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${card.color}-100 flex items-center justify-center`}>
                    <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
              </div>
            </div>
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
              <BookOpen className="w-5 h-5" />
              Quick Actions
            </h3>
          </div>
          <div className="card-content space-y-3">
            <Link
              to="/admin/workshops/create"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Create New Workshop</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/dashboard/speaker/workshops"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Manage Workshops</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/dashboard/profile"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Update Profile</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users className="w-5 h-5" />
              Workshop Overview
            </h3>
          </div>
          <div className="card-content">
            {stats?.myWorkshops === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">You haven't created any workshops yet</p>
                <Link to="/admin/workshops/create" className="btn btn-primary">
                  Create Your First Workshop
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Workshops</span>
                  <span className="text-2xl font-bold text-primary-600">{stats?.myWorkshops || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Students</span>
                  <span className="text-2xl font-bold text-success-600">{stats?.totalStudents || 0}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-warning-500 fill-warning-500" />
                    <span className="text-2xl font-bold text-warning-600">
                      {stats?.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SpeakerDashboard
