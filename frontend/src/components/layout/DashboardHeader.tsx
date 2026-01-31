import { useAuthStore } from '@/stores/authStore'
import { Bell, User, LogOut } from 'lucide-react'

const DashboardHeader = () => {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {user?.role === 'STUDENT' ? 'Student Dashboard' : 'Speaker Dashboard'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
        
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader