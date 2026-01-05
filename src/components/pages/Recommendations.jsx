import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import courseService from '@/services/api/courseService'
import moduleService from '@/services/api/moduleService'
import assessmentService from '@/services/api/assessmentService'
import learningSessionService from '@/services/api/learningSessionService'
import adaptiveLearningEngine from '@/services/api/adaptiveLearningEngine'

export default function Recommendations() {
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [learningInsights, setLearningInsights] = useState(null)
  const [adaptiveModules, setAdaptiveModules] = useState([])
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null)

  useEffect(() => {
    if (user) {
      loadRecommendations()
    }
  }, [user])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's learning history
      const sessions = await learningSessionService.getAll()
      const userSessions = sessions.filter(s => s.UserId === user.Id)
      
      const assessments = await assessmentService.getAll()
      const userAssessments = assessments.filter(a => a.studentId === user.Id)

      // Generate personalized recommendations using AI engine
      const performanceData = {
        sessions: userSessions,
        assessments: userAssessments,
        averageScore: userAssessments.length > 0 
          ? userAssessments.reduce((sum, a) => sum + a.score, 0) / userAssessments.length 
          : 0
      }

      const analysisResult = adaptiveLearningEngine.analyzePerformance(
        userSessions[userSessions.length - 1], // Latest session
        userAssessments[userAssessments.length - 1] // Latest assessment
      )

      setPerformanceAnalysis(analysisResult)

      // Get adaptive module recommendations
      const adaptiveModuleList = await moduleService.getModulesForAdaptivePath(
        user.Id, 
        performanceData
      )
      setAdaptiveModules(adaptiveModuleList.slice(0, 6))

      // Generate AI-powered recommendations
      const aiRecommendations = generateAIRecommendations(performanceData, analysisResult)
      setRecommendations(aiRecommendations)

      // Create learning insights
      const insights = generateLearningInsights(performanceData, analysisResult)
      setLearningInsights(insights)

    } catch (error) {
      console.error('Error loading recommendations:', error)
      setError('Failed to load personalized recommendations')
    } finally {
      setLoading(false)
    }
  }

  const generateAIRecommendations = (performanceData, analysis) => {
    const recommendations = []
    
    // Performance-based recommendations
    if (analysis.performanceLevel === 'excellent') {
      recommendations.push({
        id: 1,
        type: 'advancement',
        priority: 'high',
        title: 'Unlock Advanced Learning Path',
        description: 'Your exceptional performance qualifies you for accelerated learning modules.',
        action: 'Explore Advanced Courses',
        icon: 'Trophy',
        category: 'Progress'
      })
    } else if (analysis.performanceLevel === 'struggling') {
      recommendations.push({
        id: 2,
        type: 'support',
        priority: 'critical',
        title: 'Strengthen Foundation Skills',
        description: 'Focus on building core concepts before advancing to new topics.',
        action: 'Start Review Sessions',
        icon: 'BookOpen',
        category: 'Support'
      })
    }

    // Engagement-based recommendations
    if (analysis.engagementLevel === 'low') {
      recommendations.push({
        id: 3,
        type: 'engagement',
        priority: 'medium',
        title: 'Interactive Learning Boost',
        description: 'Try gamified modules and interactive exercises to increase engagement.',
        action: 'Explore Interactive Content',
        icon: 'Gamepad2',
        category: 'Engagement'
      })
    }

    // Study pattern recommendations
    if (performanceData.sessions && performanceData.sessions.length > 0) {
      const avgSessionTime = performanceData.sessions.reduce((sum, s) => 
        sum + (s.timeSpent || 0), 0) / performanceData.sessions.length

      if (avgSessionTime < 900) { // Less than 15 minutes
        recommendations.push({
          id: 4,
          type: 'study_habits',
          priority: 'medium',
          title: 'Extend Study Sessions',
          description: 'Longer focused sessions improve retention and concept mastery.',
          action: 'Set Study Goals',
          icon: 'Clock',
          category: 'Study Habits'
        })
      }
    }

    // Adaptive difficulty recommendations
    if (analysis.adaptationRecommendations) {
      analysis.adaptationRecommendations.forEach((rec, index) => {
        recommendations.push({
          id: 10 + index,
          type: rec.type,
          priority: rec.priority,
          title: `AI Suggestion: ${rec.type.replace('_', ' ').toUpperCase()}`,
          description: rec.reason,
          action: rec.action,
          icon: 'Brain',
          category: 'AI Insights'
        })
      })
    }

    return recommendations
  }

  const generateLearningInsights = (performanceData, analysis) => {
    return {
      performanceLevel: analysis.performanceLevel,
      engagementScore: analysis.engagementLevel,
      nextSteps: analysis.nextStepSuggestions || [
        'Continue with recommended modules',
        'Practice regularly for consistent improvement',
        'Seek help when needed'
      ],
      adaptationTriggers: JSON.parse(localStorage.getItem(`adaptationTriggers_${user.Id}`) || '[]'),
      learningVelocity: performanceData.assessments?.length > 1 ? 'steady' : 'building',
      recommendedFocus: analysis.performanceLevel === 'excellent' 
        ? 'Advanced applications and complex problems'
        : analysis.performanceLevel === 'struggling'
        ? 'Foundation concepts and basic skills'
        : 'Consistent practice and gradual progression'
    }
  }

  const handleRecommendationAction = (recommendation) => {
    toast.info(`Exploring: ${recommendation.title}`)
    // Implement navigation to recommended content
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Progress': return 'text-green-600'
      case 'Support': return 'text-blue-600'
      case 'Engagement': return 'text-purple-600'
      case 'Study Habits': return 'text-orange-600'
      case 'AI Insights': return 'text-indigo-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorView message={error} onRetry={loadRecommendations} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600">Personalized learning suggestions based on your performance</p>
        </div>
        <Button onClick={loadRecommendations} variant="outline" size="sm">
          <ApperIcon name="RotateCcw" size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Performance Overview */}
      {performanceAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="TrendingUp" size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Performance Level</h3>
                <p className="text-2xl font-bold text-blue-600 capitalize">
                  {performanceAnalysis.performanceLevel}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ApperIcon name="Activity" size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Engagement</h3>
                <p className="text-2xl font-bold text-purple-600 capitalize">
                  {performanceAnalysis.engagementLevel}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ApperIcon name="Target" size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recommended Focus</h3>
                <p className="text-sm text-green-600 font-medium">
                  {learningInsights?.recommendedFocus}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ApperIcon name="Brain" size={20} className="mr-2 text-purple-600" />
              Personalized Recommendations
            </h2>
            
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Sparkles" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Complete more modules to receive personalized recommendations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <ApperIcon name={rec.icon} size={16} className={getCategoryColor(rec.category)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                            <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <p className="text-xs text-gray-500">Category: {rec.category}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRecommendationAction(rec)}
                      >
                        {rec.action}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Adaptive Modules */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ApperIcon name="BookOpen" size={20} className="mr-2 text-blue-600" />
              Recommended Modules
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adaptiveModules.map((module, index) => (
                <motion.div
                  key={module.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{module.Title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {module.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{module.Description}</p>
                  
                  {module.adaptiveMetadata && (
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <ApperIcon name="Clock" size={12} className="mr-1" />
                        Est. {module.adaptiveMetadata.estimatedCompletionTime} min
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <ApperIcon name="Target" size={12} className="mr-1" />
                        {module.adaptiveMetadata.difficultyAlignment} difficulty
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Learning Insights Sidebar */}
        <div className="space-y-6">
          {learningInsights && (
            <Card className="p-6 ai-card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Lightbulb" size={16} className="mr-2 text-purple-600" />
                Learning Insights
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-800 mb-1">Learning Velocity</p>
                  <p className="text-gray-600 capitalize">{learningInsights.learningVelocity}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 mb-1">Next Steps</p>
                  <ul className="space-y-1">
                    {learningInsights.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start text-gray-600">
                        <span className="text-purple-600 mr-2">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {learningInsights.adaptationTriggers.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Recent Adaptations</p>
                    {learningInsights.adaptationTriggers.slice(0, 2).map((trigger, index) => (
                      <div key={index} className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">{trigger.type}:</span> {trigger.recommendation}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <ApperIcon name="Zap" size={16} className="mr-2 text-yellow-600" />
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="Play" size={16} className="mr-2" />
                Start Recommended Module
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="BarChart3" size={16} className="mr-2" />
                View Progress Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="Settings" size={16} className="mr-2" />
                Adjust Learning Preferences
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}