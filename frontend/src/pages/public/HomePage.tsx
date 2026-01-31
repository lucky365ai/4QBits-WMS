import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Calendar, Award, BookOpen, Sparkles } from 'lucide-react'

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Trusted by 10,000+ Learners</span>
              </motion.div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Learn, Grow, and Excel with
              <motion.span
                className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent mt-2"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                Expert-Led Workshops
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl mb-8 text-primary-100 max-w-2xl mx-auto"
            >
              Join thousands of learners in our comprehensive workshop management platform. 
              Connect with industry experts and advance your skills.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/workshops"
                  className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50 inline-flex items-center shadow-lg"
                >
                  Browse Workshops
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/auth/student/register"
                  className="btn btn-lg btn-outline border-2 border-white text-white hover:bg-white hover:text-primary-600 backdrop-blur-sm"
                >
                  Get Started Free
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage workshops, track attendance, and issue certificates
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="text-center group card p-6 hover:shadow-strong transition-all"
            >
              <motion.div
                className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="w-8 h-8 text-primary-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Expert Speakers</h3>
              <p className="text-gray-600">
                Learn from industry professionals and experienced trainers
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="text-center group card p-6 hover:shadow-strong transition-all"
            >
              <motion.div
                className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-success-200 transition-colors"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Calendar className="w-8 h-8 text-success-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">QR Attendance</h3>
              <p className="text-gray-600">
                Seamless attendance tracking with secure QR code system
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="text-center group card p-6 hover:shadow-strong transition-all"
            >
              <motion.div
                className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-warning-200 transition-colors"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Award className="w-8 h-8 text-warning-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Certificates</h3>
              <p className="text-gray-600">
                Earn verified certificates upon workshop completion
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="text-center group card p-6 hover:shadow-strong transition-all"
            >
              <motion.div
                className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <BookOpen className="w-8 h-8 text-purple-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Resources</h3>
              <p className="text-gray-600">
                Access workshop materials, presentations, and resources
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="card p-8"
            >
              <motion.div
                className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                500+
              </motion.div>
              <div className="text-gray-600 font-medium">Workshops Conducted</div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="card p-8"
            >
              <motion.div
                className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                10,000+
              </motion.div>
              <div className="text-gray-600 font-medium">Students Trained</div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="card p-8"
            >
              <motion.div
                className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                50+
              </motion.div>
              <div className="text-gray-600 font-medium">Expert Speakers</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Ready to Start Learning?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join our community of learners and take your skills to the next level
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth/student/register"
                className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
              >
                Sign Up as Student
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth/speaker/register"
                className="btn btn-lg btn-outline border-2 border-white text-white hover:bg-white hover:text-primary-600 backdrop-blur-sm"
              >
                Become a Speaker
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default HomePage