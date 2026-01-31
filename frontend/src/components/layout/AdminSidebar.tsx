import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  FileText
} from 'lucide-react'

const AdminSidebar = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const adminLinks = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/workshops', icon: Calendar, label: 'Workshops' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  ]

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {adminLinks.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(path)
                    ? 'bg-red-100 text-red-700'
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

export default AdminSidebar