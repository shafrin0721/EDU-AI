import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import StatCard from "@/components/molecules/StatCard"
import CourseCard from "@/components/molecules/CourseCard"
import ProgressRing from "@/components/molecules/ProgressRing"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import courseService from "@/services/api/courseService"
import enrollmentService from "@/services/api/enrollmentService"
import achievementService from "@/services/api/achievementService"

const Dashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      if (user?.role === "student") {
        const [enrollmentsData, achievementsData] = await Promise.all([
          enrollmentService.getByStudent(user.Id.toString()),
          achievementService.getByStudent(user.Id.toString())
        ])
        
        setEnrollments(enrollmentsData)
        setAchievements(achievementsData)

        // Get courses for enrollments
        const coursePromises = enrollmentsData.map(enrollment => 
          courseService.getById(enrollment.courseId)
        )
        const coursesData = await Promise.all(coursePromises)
        setCourses(coursesData.filter(Boolean))
      } else if (user?.role === "teacher") {
        const coursesData = await courseService.getByTeacher(user.Id.toString())
        setCourses(coursesData)
      } else if (user?.role === "admin") {
        const coursesData = await courseService.getAll()
        setCourses(coursesData)
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data")
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.Id) {
      loadDashboardData()
    }
  }, [user])

  const handleRetry = () => {
    loadDashboardData()
  }

  if (loading) return <Loading variant="skeleton" />
  if (error) return <ErrorView message={error} onRetry={handleRetry} />

  // Student Dashboard
  if (user?.role === "student") {
    const activeEnrollments = enrollments.filter(e => e.status === "active")
    const completedCourses = enrollments.filter(e => e.status === "completed")
    const averageProgress = enrollments.length > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length 
      : 0
    const recentAchievements = achievements.slice(0, 3)
    const currentStreak = user.profile?.learningStreak || 0

    return (
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user.profile?.firstName}! 🎓
            </h2>
            <p className="text-primary-100 text-lg mb-6">
              Ready to continue your learning journey?
            </p>
            
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="streak-flame">
                  <ApperIcon name="Flame" size={24} className="text-accent-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentStreak}</p>
                  <p className="text-primary-200 text-sm">Day Streak</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold">{user.profile?.totalPoints || 0}</p>
                <p className="text-primary-200 text-sm">Total Points</p>
              </div>
              
              <div>
                <p className="text-2xl font-bold">Level {user.profile?.level || 1}</p>
                <p className="text-primary-200 text-sm">Current Level</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Courses"
            value={activeEnrollments.length}
            icon="BookOpen"
            color="primary"
          />
          <StatCard
            title="Completed"
            value={completedCourses.length}
            icon="CheckCircle"
            color="success"
          />
          <StatCard
            title="Average Progress"
            value={`${Math.round(averageProgress)}%`}
            icon="TrendingUp"
            color="accent"
          />
          <StatCard
            title="Achievements"
            value={achievements.length}
            icon="Award"
            color="secondary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Continue Learning</h3>
              <Button variant="ghost" size="sm" icon="ArrowRight">
                View All
              </Button>
            </div>
            
            {activeEnrollments.length === 0 ? (
              <Empty
                title="No active courses"
                description="Explore our course catalog to start your learning journey"
                icon="BookOpen"
                actionLabel="Browse Courses"
                onAction={() => toast.info("Navigate to course catalog")}
              />
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 3).map((course, index) => {
                  const enrollment = activeEnrollments.find(e => e.courseId === course.Id.toString())
                  return (
                    <CourseCard
                      key={course.Id}
                      course={course}
                      progress={enrollment?.progress}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="p-6 text-center">
              <h4 className="font-semibold text-gray-900 mb-4">Overall Progress</h4>
              <ProgressRing 
                value={averageProgress} 
                size={120}
                color="primary"
                label="Average Completion"
              />
            </Card>

            {/* Recent Achievements */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Recent Achievements</h4>
                <ApperIcon name="Award" size={20} className="text-accent-500" />
              </div>
              
              {recentAchievements.length === 0 ? (
                <div className="text-center py-4">
                  <ApperIcon name="Award" size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No achievements yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.Id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${achievement.metadata.color}-100`}>
                        <ApperIcon 
                          name={achievement.metadata.icon} 
                          size={16} 
                          className={`text-${achievement.metadata.color}-600`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          +{achievement.metadata.points} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* AI Recommendation */}
            <Card variant="ai" className="p-6 relative">
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" size="sm">AI</Badge>
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center">
                  <ApperIcon name="Lightbulb" size={16} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Smart Recommendation</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Based on your progress in Machine Learning, we recommend exploring Advanced Neural Networks next.
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                View Course
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Teacher Dashboard
  if (user?.role === "teacher") {
    const publishedCourses = courses.filter(c => c.isPublished)
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.metadata?.enrollmentCount || 0), 0)

    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Teaching Dashboard 📚
          </h2>
          <p className="text-secondary-100 text-lg">
            Manage your courses and track student progress
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Courses"
            value={publishedCourses.length}
            icon="BookOpen"
            color="primary"
          />
          <StatCard
            title="Total Students"
            value={totalEnrollments}
            icon="Users"
            color="success"
          />
          <StatCard
            title="Course Rating"
            value="4.3"
            icon="Star"
            color="accent"
          />
          <StatCard
            title="Completion Rate"
            value="73%"
            icon="TrendingUp"
            color="secondary"
          />
        </div>

        {/* Course Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">My Courses</h3>
              <Button variant="primary" size="sm" icon="Plus">
                Create Course
              </Button>
            </div>
            
            {courses.length === 0 ? (
              <Empty
                title="No courses created"
                description="Start by creating your first course"
                icon="BookOpen"
                actionLabel="Create Course"
                onAction={() => toast.info("Navigate to course creation")}
              />
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.metadata?.enrollmentCount || 0} students</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={course.isPublished ? "success" : "warning"}
                        size="sm"
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="MoreVertical" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Activity</h3>
            <div className="text-center py-8">
              <ApperIcon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Student analytics will appear here</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  if (user?.role === "admin") {
    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            System Administration ⚙️
          </h2>
          <p className="text-gray-300 text-lg">
            Monitor platform performance and manage users
          </p>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value="1,247"
            icon="Users"
            color="primary"
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Active Courses"
            value={courses.length}
            icon="BookOpen"
            color="success"
          />
          <StatCard
            title="Platform Usage"
            value="85%"
            icon="Activity"
            color="accent"
          />
          <StatCard
            title="Revenue"
            value="$42.3K"
            icon="DollarSign"
            color="secondary"
            trend="up"
            trendValue="8.1%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">System Health</h3>
            <div className="space-y-4">
              {[
                { label: "Server Uptime", value: "99.9%", status: "success" },
                { label: "AI Processing", value: "Normal", status: "success" },
                { label: "Database", value: "Optimal", status: "success" },
                { label: "CDN", value: "Active", status: "success" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="text-center py-8">
              <ApperIcon name="Activity" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Activity logs will appear here</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return <Empty title="Role not recognized" description="Please contact support" />
}

export default Dashboard