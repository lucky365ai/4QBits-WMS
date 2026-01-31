import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { 
  Home, 
  Calendar, 
  User, 
  QrCode, 
  Award,
  BookOpen
} from 'lucide-react'

const DashboardSidebar = () => {
  const { user } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const studentLinks = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/registrations', icon: Calendar, label: 'My Registrations' },
    { path: '/dashboard/attendance', icon: QrCode, label: 'Attendance' },
    { path: '/dashboard/certificates', icon: Award, label: 'Certificates' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
  ]

  const speakerLinks = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/registrations', icon: Calendar, label: 'My Workshops' },
    { path: '/dashboard/resources', icon: BookOpen, label: 'Resources' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
  ]

  const links = user?.role === 'STUDENT' ? studentLinks : speakerLinks

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {links.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default DashboardSidebar