import React from 'react';
import { ComingSoonFeatures } from '@/components/ui/ComingSoon';
import { 
  CheckCircle, 
  Users, 
  Calendar, 
  Award, 
  QrCode, 
  BarChart3,
  Shield,
  Smartphone,
  Video,
  Brain,
  Trophy,
  MessageSquare
} from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const currentFeatures = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Multi-Role Management",
      description: "Separate dashboards for admins, speakers, students, and guest speakers with role-based permissions."
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Workshop Scheduling",
      description: "Create and manage workshops with multiple sessions, dates, and time slots."
    },
    {
      icon: <QrCode className="h-8 w-8 text-purple-600" />,
      title: "QR Code Attendance",
      description: "Secure attendance tracking with QR codes that expire in 2 minutes for maximum security."
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      title: "Digital Certificates",
      description: "Automated certificate generation with unique IDs and public verification system."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
      title: "Analytics Dashboard",
      description: "Real-time insights into registrations, attendance, revenue, and user engagement."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Security & Audit",
      description: "Complete audit logging, secure authentication, and role-based access control."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Powerful Features for
              <span className="block text-yellow-300">Workshop Management</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Everything you need to create, manage, and scale your workshop business
            </p>
          </div>
        </div>
      </div>

      {/* Current Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Now</h2>
          <p className="text-lg text-gray-600">
            Fully functional features ready for production use
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {feature.icon}
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600">
              Exciting new features in development to enhance your experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ComingSoonFeatures.MobileApp />
            <ComingSoonFeatures.LiveStreaming />
            <ComingSoonFeatures.AIRecommendations />
            <ComingSoonFeatures.AdvancedAnalytics />
            <ComingSoonFeatures.Gamification />
            <ComingSoonFeatures.SocialLearning />
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Development Roadmap</h2>
            <p className="text-lg text-gray-600">
              Our planned feature releases for the next year
            </p>
          </div>

          <div className="space-y-8">
            {/* Q1 2024 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Q1 2024
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Enhanced Analytics & Reporting
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span>Advanced Dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>Performance Metrics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>User Behavior Analysis</span>
                </div>
              </div>
            </div>

            {/* Q2 2024 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Q2 2024
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Mobile Experience & Gamification
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span>Mobile Apps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  <span>Badges & Achievements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>Leaderboards</span>
                </div>
              </div>
            </div>

            {/* Q3 2024 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Q3 2024
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Live Learning & Social Features
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-red-600" />
                  <span>Live Streaming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Discussion Forums</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Study Groups</span>
                </div>
              </div>
            </div>

            {/* Q4 2024 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  Q4 2024
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  AI & Advanced Automation
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI Recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Predictive Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span>Smart Certificates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of educators and organizations already using our platform
            </p>
            <div className="space-x-4">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;