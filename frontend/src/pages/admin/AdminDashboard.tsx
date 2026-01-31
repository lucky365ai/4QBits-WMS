import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Users, DollarSign, Award, TrendingUp, ArrowRight, Plus } from 'lucide-react'
import { dashboardApi } from '@/services/api/dashboardApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await dashboardApi.getStats('ADMIN')
      setStats(response.data)
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

  const overview = stats?.overview || {}
  const monthlyTrends = stats?.monthlyTrends || []
  const popularWorkshops = stats?.popularWorkshops || []
  const recentActivity = stats?.recentActivity || []

  const statCards = [
    {
      title: 'Total Workshops',
      value: overview.totalWorkshops || 0,
      icon: BookOpen,
      color: 'primary',
      link: '/admin/workshops',
    },
    {
      title: 'Total Users',
      value: overview.totalUsers || 0,
      icon: Users,
      color: 'success',
      link: '/admin/users',
    },
    {
      title: 'Revenue',
      value: `$${(overview.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'warning',
    },
    {
      title: 'Certificates',
      value: overview.totalCertificates || 0,
      icon: Award,
      color: 'purple',
      link: '/admin/analytics',
    },
  ]

  // Format monthly trends for chart
  const chartData = monthlyTrends.map((item: any) => ({
    month: item.month,
    registrations: Number(item.registrations) || 0,
    confirmed: Number(item.confirmed) || 0,
  }))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">System overview and analytics</p>
        </div>
        <Link to="/admin/workshops/create" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Workshop
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            {card.link ? (
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
                    <p className={`text-2xl font-bold text-${card.color}-600`}>{card.value}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="card hover:shadow-strong transition-all h-full">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${card.color}-100 flex items-center justify-center`}>
                      <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                  <p className={`text-2xl font-bold text-${card.color}-600`}>{card.value}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Registration Trends
            </h3>
          </div>
          <div className="card-content">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="confirmed" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No registration data available yet
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Popular Workshops</h3>
          </div>
          <div className="card-content">
            {popularWorkshops.length > 0 ? (
              <div className="space-y-4">
                {popularWorkshops.slice(0, 5).map((workshop: any) => (
                  <div key={workshop.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{workshop.title}</p>
                      <p className="text-xs text-gray-500">
                        {workshop.currentRegistrations} registrations
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">
                        {workshop.maxSeats ? `${Math.round((workshop.currentRegistrations / workshop.maxSeats) * 100)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No workshops available yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-content">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">
                      {activity.user?.name} registered for {activity.workshop?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge badge-${activity.status === 'CONFIRMED' ? 'success' : 'secondary'}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
