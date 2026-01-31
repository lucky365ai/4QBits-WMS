import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useState } from 'react'

const PublicHeader = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WMS</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              Workshop Management
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/workshops" className="nav-link">
              Workshops
            </Link>
            <Link to="/verify-certificate" className="nav-link">
              Verify Certificate
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/auth/student/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/workshops"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Workshops
              </Link>
              <Link
                to="/verify-certificate"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Verify Certificate
              </Link>
              
              <div className="pt-4 border-t">
                {isAuthenticated && user ? (
                  <div className="flex flex-col space-y-4">
                    <Link
                      to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center space-x-2 text-sm text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>{user.name}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-sm text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/auth/login"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth/student/register"
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default PublicHeader