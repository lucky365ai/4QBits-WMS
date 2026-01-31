import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Attendance {
  id: number
  session: {
    id: number
    title: string
    sessionDate: string
    startTime: string
    endTime: string
    workshop: {
      id: number
      title: string
      speaker: {
        name: string
      }
    }
  }
  markedAt: string
}

const AttendancePage = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/workshops/my/attendance') as any
      setAttendance(response.data?.attendance || [])
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
      toast.error('Failed to load attendance data')
      setAttendance([])
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-2">My Attendance</h2>
        <p className="text-gray-600">Track your workshop session attendance</p>
      </motion.div>

      {attendance.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-600 mb-6">
              Your attendance will appear here after you attend workshop sessions
            </p>
            <a href="/workshops" className="btn btn-primary">
              Browse Workshops
            </a>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {attendance.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="card hover:shadow-md transition-all"
            >
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{record.session.workshop.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{record.session.title}</p>
                    <p className="text-gray-500 text-sm">
                      Speaker: {record.session.workshop.speaker.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Attended</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(record.session.sessionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{record.session.startTime} - {record.session.endTime}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Marked at: {new Date(record.markedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AttendancePage
