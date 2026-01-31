import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus, Calendar, Edit, Trash } from 'lucide-react'
import { workshopApi, Workshop } from '../../services/api/workshopApi'
import toast from 'react-hot-toast'

const AdminWorkshopsPage = () => {
  const navigate = useNavigate()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      const response = await workshopApi.getAll()
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return

    try {
      await workshopApi.delete(id)
      toast.success('Workshop deleted successfully')
      fetchWorkshops()
    } catch (error) {
      console.error('Failed to delete workshop:', error)
      toast.error('Failed to delete workshop')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workshops</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your workshops and sessions</p>
        </div>
        <button
          onClick={() => navigate('/admin/workshops/create')}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workshop
        </button>
      </div>

      {workshops.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops yet</h3>
          <p className="text-gray-500 mb-6">Create your first workshop to get started.</p>
          <button
            onClick={() => navigate('/admin/workshops/create')}
            className="btn btn-primary"
          >
            Create Workshop
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workshop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speaker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workshops.map((workshop) => (
                <tr key={workshop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {workshop.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {workshop.category.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{workshop.speaker.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(workshop.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(workshop.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${workshop.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        workshop.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}`}>
                      {workshop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {workshop.price === 0 ? 'Free' : `$${workshop.price}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/workshops/${workshop.id}/edit`)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(workshop.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminWorkshopsPage