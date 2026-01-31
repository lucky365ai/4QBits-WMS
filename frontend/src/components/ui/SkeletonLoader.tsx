import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
}

const SkeletonLoader = ({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height,
  count = 1 
}: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={i === 0 ? style : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export const WorkshopCardSkeleton = () => (
  <div className="card overflow-hidden">
    <SkeletonLoader variant="rectangular" height={192} className="w-full" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <SkeletonLoader variant="text" width={100} height={24} />
        <SkeletonLoader variant="text" width={60} height={24} />
      </div>
      <SkeletonLoader variant="text" width="80%" height={28} />
      <SkeletonLoader variant="text" width="100%" height={16} count={2} />
      <SkeletonLoader variant="rectangular" width="100%" height={40} className="rounded-md" />
    </div>
  </div>
)

export default SkeletonLoader
