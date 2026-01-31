import { useEffect, useState } from 'react'
import { apiClient } from '@/services/api/client'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AuditLog {
  id: number
  action: string
  entityType: string
  entityId: number
  ipAddress: string
  createdAt: string
  user?: {
    name: string
    email: string
    role: string
  }
}

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/admin/audit-logs?page=${page}`) as any
      setLogs(response.data.logs)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audit Logs</h2>
      </div>

      <div className="card">
        <div className="card-content">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>IP Address</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          {log.user ? (
                            <div>
                              <div className="font-medium">{log.user.name}</div>
                              <div className="text-xs text-gray-500">{log.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">System</span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-secondary">{log.action}</span>
                        </td>
                        <td>
                          <span className="text-sm font-mono text-gray-600">
                            {log.entityType} #{log.entityId}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{log.ipAddress}</td>
                        <td className="text-sm text-gray-600">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No audit logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAuditLogsPage
