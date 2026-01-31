import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Download, ExternalLink, Calendar } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Certificate {
  id: number
  certificateId: string
  workshop: {
    id: number
    title: string
    speaker: {
      name: string
    }
  }
  issuedAt: string
  verifiedAt: string | null
}

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/certificates/my-certificates') as any
      setCertificates(response.data?.certificates || [])
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
      // If endpoint doesn't exist, show empty state
      setCertificates([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (certificateId: string) => {
    try {
      toast.loading('Downloading certificate...')
      await apiClient.get(`/certificates/${certificateId}/download`, {
        responseType: 'blob',
      })
      toast.success('Certificate downloaded!')
    } catch (error) {
      toast.error('Failed to download certificate')
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
        <h2 className="text-3xl font-bold mb-2">My Certificates</h2>
        <p className="text-gray-600">View and download your workshop completion certificates</p>
      </motion.div>

      {certificates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-6">
              Complete workshops and provide feedback to earn certificates
            </p>
            <a href="/workshops" className="btn btn-primary">
              Browse Workshops
            </a>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="card hover:shadow-strong transition-all"
            >
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Award className="w-8 h-8 text-warning-600" />
                  </div>
                  <span className="badge badge-success">Verified</span>
                </div>

                <h3 className="text-xl font-bold mb-2">{certificate.workshop.title}</h3>
                <p className="text-gray-600 mb-4">
                  Speaker: {certificate.workshop.speaker.name}
                </p>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: {formatDate(certificate.issuedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      ID: {certificate.certificateId}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleDownload(certificate.certificateId)}
                    className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <a
                    href={`/verify-certificate?certificateId=${certificate.certificateId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CertificatesPage
