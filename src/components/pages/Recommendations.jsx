import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import courseService from "@/services/api/courseService"
import enrollmentService from "@/services/api/enrollmentService"
import assessmentService from "@/services/api/assessmentService"

const Recommendations = () => {
  const { user } = useSelector(state => state.auth)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Get student's enrollment and assessment data for AI recommendations
      const [enrollments, allCourses] = await Promise.all([
        enrollmentService.getByStudent(user.Id.toString()),
        courseService.getAll()
      ])

      // Mock AI recommendation engine
      const generateRecommendations = () => {
        const availableCourses = allCourses.filter(course => 
          !enrollments.some(e => e.courseId === course.Id.toString())
        )

        return [
          {
            id: 1,
            type: "course",
            title: "Advanced Machine Learning",
            description: "Based on your strong performance in Python fundamentals, this advanced ML course would be perfect for your next step.",
            confidence: 0.92,
            reason: "High performance in prerequisite courses",
            course: availableCourses[0] || {
              Id: 999,
              title: "Advanced Machine Learning",
              description: "Deep dive into neural networks and advanced algorithms",
              difficulty: "advanced",
              metadata: { duration: 480, enrollmentCount: 156 }
            },
            icon: "Brain",
            color: "primary"
          },
          {
            id: 2,
            type: "skill_development",
            title: "Focus on Data Visualization",
            description: "Your assessment results suggest strengthening data visualization skills would complement your current knowledge.",
            confidence: 0.85,
            reason: "Identified skill gap in assessments",
            actionItems: [
              "Practice with D3.js tutorials",
              "Complete data storytelling exercises", 
              "Build portfolio projects with charts"
            ],
            icon: "BarChart3",
            color: "accent"
          },
          {
            id: 3,
            type: "study_optimization",
            title: "Adjust Study Schedule",
            description: "Your engagement patterns show you're most focused during morning sessions. Consider shifting complex topics to 9-11 AM.",
            confidence: 0.78,
            reason: "Learning pattern analysis",
            recommendations: [
              "Schedule difficult topics for morning",
              "Use afternoon for practice exercises",
              "Take breaks every 45 minutes"
            ],
            icon: "Clock",
            color: "secondary"
          }
        ]
      }

      setRecommendations(generateRecommendations())
    } catch (err) {
      setError(err.message || "Failed to load recommendations")
      toast.error("Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRecommendation = async (recommendation) => {
    if (recommendation.type === "course" && recommendation.course) {
      try {
        await enrollmentService.create({
          studentId: user.Id.toString(),
          courseId: recommendation.course.Id.toString()
        })
        toast.success(`Enrolled in ${recommendation.course.title}!`)
        // Remove the recommendation
        setRecommendations(prev => prev.filter(r => r.id !== recommendation.id))
      } catch (err) {
        toast.error("Failed to enroll in course")
      }
    } else {
      toast.success("Recommendation marked as accepted!")
      setRecommendations(prev => prev.filter(r => r.id !== recommendation.id))
    }
  }

  const handleDismissRecommendation = (recommendationId) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
    toast.info("Recommendation dismissed")
  }

  useEffect(() => {
    if (user?.Id) {
      loadRecommendations()
    }
  }, [user])

  const handleRetry = () => {
    loadRecommendations()
  }

  if (loading) return <Loading variant="skeleton" />
  if (error) return <ErrorView message={error} onRetry={handleRetry} />

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Recommendations 🤖</h1>
            <p className="text-secondary-100 text-lg">
              Personalized suggestions to accelerate your learning
            </p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="bg-white/20 text-white">
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <Empty
          title="No recommendations available"
          description="Complete more assessments and courses to receive personalized AI recommendations"
          icon="Lightbulb"
          actionLabel="Browse Courses"
          onAction={() => toast.info("Navigate to courses")}
        />
      ) : (
        <div className="space-y-6">
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card variant="ai" className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${recommendation.color}-100`}>
                    <ApperIcon 
                      name={recommendation.icon} 
                      size={24} 
                      className={`text-${recommendation.color}-600`}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {recommendation.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" size="sm">
                          {Math.round(recommendation.confidence * 100)}% match
                        </Badge>
                        <Badge variant="outline" size="sm" className="capitalize">
                          {recommendation.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {recommendation.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Brain" size={16} />
                        <span>AI Analysis: {recommendation.reason}</span>
                      </div>
                    </div>

                    {/* Course Recommendation Details */}
                    {recommendation.type === "course" && recommendation.course && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{recommendation.course.title}</h4>
                            <p className="text-sm text-gray-600">{recommendation.course.description}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <ApperIcon name="Clock" size={14} />
                                <span>{Math.round(recommendation.course.metadata?.duration / 60)}h</span>
                              </div>
                              <Badge 
                                variant={
                                  recommendation.course.difficulty === "beginner" ? "success" :
                                  recommendation.course.difficulty === "intermediate" ? "warning" : "danger"
                                }
                                size="sm"
                              >
                                {recommendation.course.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
                    {recommendation.actionItems && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                        <ul className="space-y-1">
                          {recommendation.actionItems.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                              <ApperIcon name="CheckCircle" size={14} className="text-green-500 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Study Recommendations */}
                    {recommendation.recommendations && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Study Tips:</h5>
                        <ul className="space-y-1">
                          {recommendation.recommendations.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                              <ApperIcon name="Lightbulb" size={14} className="text-yellow-500 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptRecommendation(recommendation)}
                      >
                        {recommendation.type === "course" ? "Enroll Now" : "Accept"}
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissRecommendation(recommendation.id)}
                      >
                        Dismiss
                      </Button>
                      <Button variant="ghost" size="sm" icon="Info">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="TrendingUp" size={24} className="text-primary-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Learning Velocity</h4>
            <p className="text-2xl font-bold text-primary-600">Fast</p>
            <p className="text-sm text-gray-600">You complete content 23% faster than average</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="Target" size={24} className="text-accent-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Optimal Difficulty</h4>
            <p className="text-2xl font-bold text-accent-600">Intermediate</p>
            <p className="text-sm text-gray-600">Based on your performance patterns</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="Clock" size={24} className="text-secondary-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Best Study Time</h4>
            <p className="text-2xl font-bold text-secondary-600">Morning</p>
            <p className="text-sm text-gray-600">Peak engagement: 9-11 AM</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Recommendations