import { Outlet } from 'react-router-dom'
import AdminHeader from '@/components/layout/AdminHeader'
import AdminSidebar from '@/components/layout/AdminSidebar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout