import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

const LoadingSpinner = ({ size = 'md', className, fullScreen = false }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-16 w-16 border-4',
  }

  const spinner = (
    <motion.div
      className={cn(
        'spinner border-primary-500 border-t-transparent rounded-full',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <span className="sr-only">Loading...</span>
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          {spinner}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-sm"
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner