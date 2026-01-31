import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { dashboardApi } from '@/services/api/dashboardApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Download, Users, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminAnalyticsPage = () => {
  const [revenueData, setRevenueData] = useState<any>(null)
  const [engagementData, setEngagementData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [revenueRes, engagementRes] = await Promise.all([
        dashboardApi.getRevenueAnalytics(),
        dashboardApi.getUserEngagement()
      ])
      setRevenueData(revenueRes.data)
      setEngagementData(engagementRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (type: string) => {
    try {
      toast.loading('Exporting data...')
      await dashboardApi.exportAnalytics(type, 'csv')
      toast.success('Export started')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-12"><LoadingSpinner /></div>
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <div className="flex gap-2">
          <button onClick={() => handleExport('users')} className="btn btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Users
          </button>
          <button onClick={() => handleExport('registrations')} className="btn btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Registrations
          </button>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Revenue Trends
            </h3>
          </div>
          <div className="card-content h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">Revenue by Category</h3>
          </div>
          <div className="card-content h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData?.categoryRevenue || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {(revenueData?.categoryRevenue || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* User Engagement */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Users className="w-5 h-5" /> Top Active Users
          </h3>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Registrations</th>
                  <th>Attendance</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {(engagementData?.activeUsers || []).map((user: any) => (
                  <tr key={user.id}>
                    <td className="font-medium">{user.name}</td>
                    <td>{user.totalRegistrations}</td>
                    <td>{user.totalAttendance}</td>
                    <td>{user.totalFeedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminAnalyticsPage
