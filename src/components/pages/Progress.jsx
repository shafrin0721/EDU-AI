import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import Chart from "react-apexcharts"
import ProgressRing from "@/components/molecules/ProgressRing"
import StatCard from "@/components/molecules/StatCard"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import AppIcon from "@/components/AppIcon"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import enrollmentService from "@/services/api/enrollmentService"
import courseService from "@/services/api/courseService"
import learningSessionService from "@/services/api/learningSessionService"

const Progress = () => {
  const { user } = useSelector(state => state.auth)
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadProgressData = async () => {
    try {
      setLoading(true)
      setError("")

      // Get all enrollments and filter by user ID
      const allEnrollments = await enrollmentService.getAll()
      const userEnrollments = allEnrollments.filter(e => String(e.studentId) === String(user.Id))
      
      // Get analytics data
      const analyticsData = await learningSessionService.getStudentAnalytics(user.Id.toString())

      setEnrollments(userEnrollments)
      setAnalytics(analyticsData)

      // Get course details
      const coursePromises = userEnrollments.map(enrollment => 
        courseService.getById(enrollment.courseId)
      )
      const coursesData = await Promise.all(coursePromises)
      setCourses(coursesData.filter(Boolean))

    } catch (err) {
      setError(err.message || "Failed to load progress data")
      toast.error("Failed to load progress data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.Id) {
      loadProgressData()
    }
  }, [user])

  const handleRetry = () => {
    loadProgressData()
  }

  if (loading) return <Loading variant="skeleton" />
  if (error) return <ErrorView message={error} onRetry={handleRetry} />
  if (enrollments.length === 0) {
    return (
      <div className="p-6">
        <Empty
          title="No learning progress yet"
          description="Enroll in courses to start tracking your progress"
          icon="TrendingUp"
          actionLabel="Browse Courses"
          onAction={() => toast.info("Navigate to courses")}
        />
      </div>
    )
  }

  const completedCourses = enrollments.filter(e => e.status === "completed").length
  const activeCourses = enrollments.filter(e => e.status === "active").length
  const overallProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length

  // Progress chart data
  const progressChartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#4F46E5', '#7C3AED']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
    },
    yaxis: {
      title: { text: 'Progress %' }
    },
    colors: ['#4F46E5', '#7C3AED'],
    legend: {
      position: 'top'
    }
  }

  const progressChartSeries = [
    {
      name: 'Course Progress',
      data: [10, 25, 40, 55, 68, Math.round(overallProgress)]
    }
  ]

  // Skill radar chart data
  const skillRadarOptions = {
    chart: {
      type: 'radar',
      height: 350
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#e5e7eb',
          fill: {
            colors: ['#f9fafb', '#f3f4f6']
          }
        }
      }
    },
    colors: ['#4F46E5'],
    markers: {
      size: 4,
      colors: ['#4F46E5'],
      strokeColors: '#fff',
      strokeWidth: 2
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + "/10"
        }
      }
    },
    xaxis: {
      categories: ['Programming', 'Data Science', 'AI/ML', 'Web Dev', 'Algorithms', 'Statistics']
    },
    yaxis: {
      tickAmount: 5,
      min: 0,
      max: 10
    }
  }

  const skillRadarSeries = [{
    name: 'Skill Level',
    data: [7, 6, 5, 8, 4, 6]
  }]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Learning Progress 📈</h1>
          <p className="text-primary-100 text-lg">
            Track your learning journey and skill development
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Overall Progress"
          value={`${Math.round(overallProgress)}%`}
          icon="TrendingUp"
          color="primary"
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Active Courses"
          value={activeCourses}
          icon="BookOpen"
          color="accent"
        />
        <StatCard
          title="Completed"
          value={completedCourses}
          icon="CheckCircle"
          color="success"
        />
        <StatCard
          title="Study Time"
          value={`${Math.round(analytics?.totalTimeSpent || 0)}h`}
          icon="Clock"
          color="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Progress Over Time</h3>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <AppIcon name="Download" size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <AppIcon name="MoreVertical" size={16} />
                </Button>
              </div>
            </div>
            <Chart
              options={progressChartOptions}
              series={progressChartSeries}
              type="line"
              height={300}
            />
          </Card>

          {/* Course Progress */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Course Progress</h3>
            <div className="space-y-4">
              {enrollments.map((enrollment, index) => {
                const course = courses.find(c => c.Id.toString() === enrollment.courseId)
                if (!course) return null

                return (
                  <motion.div
                    key={enrollment.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                        <AppIcon name="BookOpen" size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-500">
                          {enrollment.status === "completed" ? "Completed" : `${Math.round(enrollment.progress)}% complete`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                      <Badge 
                        variant={enrollment.status === "completed" ? "success" : "primary"}
                        size="sm"
                      >
                        {enrollment.status === "completed" ? "Done" : "Active"}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Progress Ring */}
          <Card className="p-6 text-center">
            <h4 className="font-semibold text-gray-900 mb-4">Overall Progress</h4>
            <ProgressRing 
              value={overallProgress} 
              size={120}
              color="primary"
              label="Average Completion"
            />
            <div className="mt-4 text-sm text-gray-600">
              Keep going! You're doing great.
            </div>
          </Card>

          {/* Skill Radar */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Skill Assessment</h4>
            <Chart
              options={skillRadarOptions}
              series={skillRadarSeries}
              type="radar"
              height={280}
              className="skill-radar"
            />
          </Card>

          {/* Learning Stats */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Learning Stats</h4>
            <div className="space-y-4">
              {[
                { 
                  icon: "Target", 
                  label: "Avg Performance", 
                  value: `${Math.round((analytics?.averagePerformance || 0) * 100)}%`,
                  color: "text-green-600"
                },
                { 
                  icon: "Zap", 
                  label: "Engagement", 
                  value: `${Math.round((analytics?.averageEngagement || 0) * 100)}%`,
                  color: "text-blue-600"
                },
                { 
                  icon: "Clock", 
                  label: "Avg Session", 
                  value: `${Math.round(analytics?.totalTimeSpent / analytics?.totalSessions || 0)}min`,
                  color: "text-purple-600"
                },
                { 
                  icon: "Calendar", 
                  label: "Study Days", 
                  value: analytics?.totalSessions || 0,
                  color: "text-amber-600"
                }
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <AppIcon name={stat.icon} size={16} className={stat.color} />
                    </div>
                    <span className="text-sm text-gray-600">{stat.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Progress
