import React from 'react';
import { Clock, Star, Zap, Users, Calendar, Award } from 'lucide-react';

interface ComingSoonProps {
  feature: string;
  description?: string;
  icon?: React.ReactNode;
  estimatedDate?: string;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  feature,
  description,
  icon,
  estimatedDate,
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        {icon || <Zap className="h-6 w-6 text-blue-600" />}
        <h3 className="text-lg font-semibold text-gray-900">{feature}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Coming Soon
        </span>
      </div>
      
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{estimatedDate || 'Coming Soon'}</span>
        </div>
        
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Get Notified →
        </button>
      </div>
    </div>
  );
};

// Predefined coming soon features
export const ComingSoonFeatures = {
  MobileApp: () => (
    <ComingSoon
      feature="Mobile App"
      description="Native iOS and Android apps for seamless workshop management on the go"
      icon={<Users className="h-6 w-6 text-blue-600" />}
      estimatedDate="Q2 2024"
    />
  ),
  
  LiveStreaming: () => (
    <ComingSoon
      feature="Live Streaming"
      description="Stream workshops live to remote participants with interactive features"
      icon={<Star className="h-6 w-6 text-purple-600" />}
      estimatedDate="Q3 2024"
    />
  ),
  
  AIRecommendations: () => (
    <ComingSoon
      feature="AI-Powered Recommendations"
      description="Personalized workshop suggestions based on your interests and learning history"
      icon={<Zap className="h-6 w-6 text-yellow-600" />}
      estimatedDate="Q4 2024"
    />
  ),
  
  AdvancedAnalytics: () => (
    <ComingSoon
      feature="Advanced Analytics Dashboard"
      description="Deep insights into workshop performance, user engagement, and revenue trends"
      icon={<Calendar className="h-6 w-6 text-green-600" />}
      estimatedDate="Q1 2024"
    />
  ),
  
  Gamification: () => (
    <ComingSoon
      feature="Gamification & Badges"
      description="Earn points, badges, and achievements for completing workshops and activities"
      icon={<Award className="h-6 w-6 text-orange-600" />}
      estimatedDate="Q2 2024"
    />
  ),
  
  SocialLearning: () => (
    <ComingSoon
      feature="Social Learning Hub"
      description="Connect with other learners, form study groups, and share knowledge"
      icon={<Users className="h-6 w-6 text-indigo-600" />}
      estimatedDate="Q3 2024"
    />
  ),
};

export default ComingSoon;