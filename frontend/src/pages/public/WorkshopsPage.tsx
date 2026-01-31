import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Calendar, User, Sparkles } from 'lucide-react'
import { workshopApi, Workshop } from '@/services/api/workshopApi'
import { WorkshopCardSkeleton } from '@/components/ui/SkeletonLoader'
import { debounce } from '@/lib/utils'
import toast from 'react-hot-toast'

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await workshopApi.getAll()
      setWorkshops(response.data.workshops)
    } catch (error) {
      console.error('Failed to fetch workshops:', error)
      toast.error('Failed to load workshops')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Memoized filtered workshops
  const filteredWorkshops = useMemo(() => {
    return workshops.filter(workshop => {
      const lowerSearchTerm = searchTerm.toLowerCase()
      const matchesSearch = 
        workshop.title.toLowerCase().includes(lowerSearchTerm) ||
        workshop.description.toLowerCase().includes(lowerSearchTerm) ||
        workshop.tags?.toLowerCase().includes(lowerSearchTerm)
      const matchesCategory = category ? workshop.category.slug === category : true
      return matchesSearch && matchesCategory
    })
  }, [workshops, searchTerm, category])

  // Debounced search handler
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(e.target.value)
  }, [debouncedSetSearchTerm])

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(workshops.map(w => ({ slug: w.category.slug, name: w.category.name }))))
      .map(({ slug, name }) => ({ slug, name }))
  }, [workshops])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Header and Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Available Workshops
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative w-full md:w-96"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workshops..."
              className="input pl-10 w-full transition-all focus:ring-2 focus:ring-primary-500"
              onChange={handleSearchChange}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              className="input w-full md:w-48 transition-all focus:ring-2 focus:ring-primary-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(({ slug, name }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </motion.div>
        </div>

        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-600 mt-4"
          >
            Showing {filteredWorkshops.length} of {workshops.length} workshops
          </motion.p>
        )}
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <WorkshopCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No workshops found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setCategory('')
            }}
            className="btn btn-primary"
          >
            Clear Filters
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchTerm}-${category}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredWorkshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card hover:shadow-strong transition-all duration-300 overflow-hidden group"
              >
                {workshop.bannerImage ? (
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={workshop.bannerImage}
                      alt={workshop.title}
                      className="w-full h-48 object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-primary-400" />
                  </div>
                )}
                <div className="card-content">
                  <div className="flex justify-between items-start mb-3">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="badge badge-primary"
                    >
                      {workshop.category.name}
                    </motion.span>
                    <span className="text-lg font-bold text-primary-600">
                      {workshop.price === 0 ? (
                        <span className="text-success-600">Free</span>
                      ) : (
                        `$${workshop.price}`
                      )}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {workshop.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{workshop.description}</p>

                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(workshop.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{workshop.speaker.name}</span>
                    </div>
                  </div>

                  <Link
                    to={`/workshops/${workshop.id}`}
                    className="btn btn-primary w-full justify-center group-hover:shadow-md transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default WorkshopsPage