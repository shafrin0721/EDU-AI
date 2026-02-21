import React from 'react'
import { motion } from 'framer-motion'
import AppIcon from '@/components/AppIcon'

const EngagementMetrics = ({ metrics, loading = false }) => {
  const getEngagementColor = (level) => {
    const colors = {
      high: 'bg-green-500',
      moderate: 'bg-blue-500',
      low: 'bg-yellow-500',
      critical: 'bg-red-500'
    }
    return colors[level] || 'bg-gray-500'
  }

  const getEngagementTextColor = (level) => {
    const colors = {
      high: 'text-green-600',
      moderate: 'text-blue-600',
      low: 'text-yellow-600',
      critical: 'text-red-600'
    }
    return colors[level] || 'text-gray-600'
  }

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return 'TrendingUp'
    if (trend === 'declining') return 'TrendingDown'
    return 'Minus'
  }

  const engagementLevels = [
    { key: 'high', label: 'High Engagement', color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'moderate', label: 'Moderate', color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'low', label: 'Low Engagement', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { key: 'critical', label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50' }
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AppIcon name="Activity" size={20} className="mr-2 text-indigo-600" />
          Engagement Metrics
        </h3>
        {metrics?.trend && (
          <div className={`flex items-center text-sm font-medium ${metrics.trend === 'improving' ? 'text-green-600' : metrics.trend === 'declining' ? 'text-red-600' : 'text-gray-500'}`}>
            <AppIcon name={getTrendIcon(metrics.trend)} size={16} className="mr-1" />
            {metrics.trend === 'improving' ? 'Improving' : metrics.trend === 'declining' ? 'Declining' : 'Stable'}
          </div>
        )}
      </div>

      {/* Overall Engagement Score */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Engagement Score</span>
          <span className={`text-2xl font-bold ${getEngagementTextColor(metrics?.level)}`}>
            {metrics?.overallScore ? `${Math.round(metrics.overallScore * 100)}%` : 'N/A'}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(metrics?.overallScore || 0) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${getEngagementColor(metrics?.level)}`}
          />
        </div>
      </div>

      {/* Engagement Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Distribution</h4>
        <div className="grid grid-cols-2 gap-3">
          {engagementLevels.map((level) => (
            <motion.div
              key={level.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${level.bg} rounded-lg p-3`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
                <span className={`text-lg font-bold ${level.color}`}>
                  {metrics?.distribution?.[level.key] || 0}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Engagement Factors */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Factors</h4>
        <div className="space-y-3">
          {[
            { key: 'timeSpent', label: 'Time on Content', icon: 'Clock' },
            { key: 'interactions', label: 'Interactions', icon: 'MousePointer' },
            { key: 'practice', label: 'Practice Exercises', icon: 'PenTool' },
            { key: 'sessionFrequency', label: 'Login Frequency', icon: 'LogIn' }
          ].map((factor) => (
            <div key={factor.key} className="flex items-center justify-between">
              <div className="flex items-center">
                <AppIcon name={factor.icon} size={16} className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{factor.label}</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(metrics?.features?.[factor.key] || 0) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">
                  {Math.round((metrics?.features?.[factor.key] || 0) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {metrics?.warnings && metrics.warnings.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <AppIcon name="AlertTriangle" size={16} className="mr-2 text-yellow-500" />
            Engagement Alerts
          </h4>
          <div className="space-y-2">
            {metrics.warnings.map((warning, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start text-sm"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${warning.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                <span className="text-gray-600">{warning.message}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EngagementMetrics
