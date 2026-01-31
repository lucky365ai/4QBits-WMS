import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Briefcase, Save } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface UserProfile {
  id: number
  email: string
  name: string
  role: string
  bio: string | null
  profileImage: string | null
  socialLinks: string | null
  expertise: string | null
  phone: string | null
  isVerified: boolean
  isApproved: boolean
  createdAt: string
}

const ProfilePage = () => {
  const { setUser } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    expertise: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/users/profile') as any
      const userData = response.data?.user
      setProfile(userData)
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        expertise: userData.expertise || '',
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const response = await apiClient.put('/users/profile', formData) as any
      setProfile(response.data.user)
      setUser(response.data.user)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="card">
        <div className="card-content text-center py-12">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-2">My Profile</h2>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card">
            <div className="card-content text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary-600" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
              <p className="text-gray-600 mb-4">{profile.email}</p>
              <span className="badge badge-primary">{profile.role}</span>
              {profile.isVerified && (
                <div className="mt-4">
                  <span className="badge badge-success">Verified</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit} className="card">
            <div className="card-header">
              <h3 className="card-title">Edit Profile</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input bg-gray-50"
                />
                <p className="form-help">Email cannot be changed</p>
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="textarea"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expertise</label>
                  <input
                    type="text"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    className="input"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                  <p className="form-help">Comma-separated list of skills</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={fetchProfile}
                  className="btn btn-outline"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage
