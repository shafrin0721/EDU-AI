import React from 'react'
import { motion } from 'framer-motion'
import AppIcon from '@/components/AppIcon'
import AnalyticsChart from './AnalyticsChart'

const KnowledgeGapAnalysis = ({ gaps, loading = false }) => {
  const getGapSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    }
    return colors[severity] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getMasteryColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare heatmap data for topic mastery
  const topicMasteryData = {
    series: gaps?.topicMastery?.map((topic, index) => ({
      name: topic.name,
      data: [{ x: 'Mastery', y: topic.mastery }]
    })) || []
  }

  // Prepare radar data for skill analysis
  const skillAnalysisData = {
    series: [{
      name: 'Skill Level',
      data: gaps?.skills?.map(s => s.level) || [65, 72, 58, 80, 45, 70, 85]
    }],
    labels: gaps?.skills?.map(s => s.name) || ['Problem Solving', 'Critical Thinking', 'Communication', 'Technical', 'Creative', 'Analytical', 'Collaboration']
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AppIcon name="Brain" size={20} className="mr-2 text-indigo-600" />
          Knowledge Gap Analysis
        </h3>
        <span className="text-sm text-gray-500">
          {gaps?.totalGaps || 0} gaps identified
        </span>
      </div>

      {/* Critical Gaps Alert */}
      {gaps?.criticalGaps && gaps.criticalGaps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center mb-3">
            <AppIcon name="AlertCircle" size={18} className="text-red-600 mr-2" />
            <span className="font-medium text-red-700">Critical Knowledge Gaps</span>
          </div>
          <div className="space-y-2">
            {gaps.criticalGaps.map((gap, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-red-600">{gap.topic}</span>
                <span className="text-red-500">{gap.affectedStudents} students affected</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Topic Mastery Overview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Topic Mastery Overview</h4>
        <div className="space-y-3">
          {gaps?.topics?.slice(0, 6).map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                  <span className="text-xs text-gray-500">{topic.mastery}% mastery</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.mastery}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${getMasteryColor(topic.mastery)}`}
                  />
                </div>
              </div>
              {topic.mastery < 50 && (
                <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getGapSeverityColor(topic.severity)}`}>
                  {topic.severity}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skill Analysis Radar Chart */}
      <div className="mb-6">
        <AnalyticsChart
          title="Skill Analysis"
          type="radar"
          data={skillAnalysisData}
          height={280}
          colors={['#6366f1']}
        />
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <AppIcon name="Lightbulb" size={16} className="mr-2 text-yellow-500" />
          AI-Powered Recommendations
        </h4>
        <div className="space-y-2">
          {gaps?.recommendations?.slice(0, 4).map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start p-3 bg-indigo-50 rounded-lg"
            >
              <AppIcon name="ArrowRight" size={16} className="text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">{rec.action}</p>
                <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
            <AppIcon name="Mail" size={14} className="mr-2" />
            Send Reminders
          </button>
          <button className="flex items-center justify-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
            <AppIcon name="FileText" size={14} className="mr-2" />
            Generate Report
          </button>
          <button className="flex items-center justify-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
            <AppIcon name="Users" size={14} className="mr-2" />
            Group Students
          </button>
          <button className="flex items-center justify-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            <AppIcon name="Plus" size={14} className="mr-2" />
            Add Resources
          </button>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeGapAnalysis
