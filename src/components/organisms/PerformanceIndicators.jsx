import React from 'react'
import { motion } from 'framer-motion'
import AppIcon from '@/components/AppIcon'
import AnalyticsChart from './AnalyticsChart'

const PerformanceIndicators = ({ performance, loading = false }) => {
  const getPerformanceColor = (level) => {
    const colors = {
      excellent: 'text-green-600',
      proficient: 'text-blue-600',
      developing: 'text-yellow-600',
      struggling: 'text-red-600'
    }
    return colors[level] || 'text-gray-600'
  }

  const getPerformanceBg = (level) => {
    const colors = {
      excellent: 'bg-green-50',
      proficient: 'bg-blue-50',
      developing: 'bg-yellow-50',
      struggling: 'bg-red-50'
    }
    return colors[level] || 'bg-gray-50'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const scoreDistributionData = {
    series: [performance?.distribution?.excellent || 0, performance?.distribution?.proficient || 0, 
             performance?.distribution?.developing || 0, performance?.distribution?.struggling || 0],
    labels: ['Excellent', 'Proficient', 'Developing', 'Struggling']
  }

  const progressTrendData = {
    series: [{
      name: 'Average Score',
      data: performance?.trend || [65, 68, 72, 70, 75, 78, 82]
    }],
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
  }

  const completionData = {
    series: [{
      name: 'Completion Rate',
      data: performance?.completionTrend || [45, 52, 58, 65, 70, 75, 82]
    }],
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AppIcon name="BarChart2" size={20} className="mr-2 text-indigo-600" />
          Performance Indicators
        </h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${getPerformanceBg(performance?.level)} rounded-lg p-4`}
        >
          <div className="flex items-center justify-between mb-2">
            <AppIcon name="Target" size={20} className="text-gray-600" />
            <span className="text-xs text-gray-500">Overall</span>
          </div>
          <div className={`text-2xl font-bold ${getPerformanceColor(performance?.level)}`}>
            {performance?.averageScore ? `${Math.round(performance.averageScore)}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Level: <span className="font-medium capitalize">{performance?.level || 'N/A'}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <AppIcon name="CheckCircle" size={20} className="text-gray-600" />
            <span className="text-xs text-gray-500">Completion</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {performance?.completionRate ? `${Math.round(performance.completionRate)}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Course completion rate
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-indigo-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <AppIcon name="TrendingUp" size={20} className="text-gray-600" />
            <span className="text-xs text-gray-500">Growth</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {performance?.growth ? `+${performance.growth}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Week over week
          </div>
        </motion.div>
      </div>

      {/* Performance Distribution Chart */}
      <div className="mb-6">
        <AnalyticsChart
          title="Score Distribution"
          type="donut"
          data={scoreDistributionData}
          height={220}
          colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']}
        />
      </div>

      {/* Progress Trend Chart */}
      <div className="mb-6">
        <AnalyticsChart
          title="Progress Trend"
          type="area"
          data={progressTrendData}
          height={200}
        />
      </div>

      {/* Completion Trend Chart */}
      <div>
        <AnalyticsChart
          title="Completion Rate Trend"
          type="bar"
          data={completionData}
          height={200}
          colors={['#8b5cf6']}
        />
      </div>
    </div>
  )
}

export default PerformanceIndicators
