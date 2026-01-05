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
import achievementService from "@/services/api/achievementService"

const Achievements = () => {
  const { user } = useSelector(state => state.auth)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { value: "all", label: "All Achievements", icon: "Award" },
    { value: "course", label: "Course Completion", icon: "BookOpen" },
    { value: "assessment", label: "Assessment", icon: "Target" },
    { value: "streak", label: "Learning Streaks", icon: "Flame" },
    { value: "skill", label: "Skill Mastery", icon: "Brain" },
    { value: "time", label: "Time Milestones", icon: "Clock" }
  ]

  const loadAchievements = async () => {
    try {
      setLoading(true)
      setError("")
      const achievementsData = await achievementService.getByStudent(user.Id.toString())
      setAchievements(achievementsData)
    } catch (err) {
      setError(err.message || "Failed to load achievements")
      toast.error("Failed to load achievements")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.Id) {
      loadAchievements()
    }
  }, [user])

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(achievement => achievement.type === selectedCategory)

  const totalPoints = achievements.reduce((sum, achievement) => 
    sum + (achievement.metadata?.points || 0), 0
  )

  const handleRetry = () => {
    loadAchievements()
  }

  if (loading) return <Loading variant="skeleton" />
  if (error) return <ErrorView message={error} onRetry={handleRetry} />

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Achievements 🏆</h1>
          <p className="text-accent-100 text-lg mb-6">
            Celebrate your learning milestones and accomplishments
          </p>
          <div className="flex items-center space-x-8">
            <div>
              <p className="text-3xl font-bold">{achievements.length}</p>
              <p className="text-accent-200 text-sm">Total Achievements</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totalPoints}</p>
              <p className="text-accent-200 text-sm">Points Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "primary" : "ghost"}
            size="sm"
            icon={category.icon}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <Empty
          title="No achievements yet"
          description="Keep learning to unlock your first achievement!"
          icon="Award"
          actionLabel="Browse Courses"
          onAction={() => toast.info("Navigate to courses")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card hoverable className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-${achievement.metadata?.color || 'primary'}-100`}>
                  <ApperIcon 
                    name={achievement.metadata?.icon || "Award"} 
                    size={32} 
                    className={`text-${achievement.metadata?.color || 'primary'}-600`}
                  />
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {achievement.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" size="sm">
                    +{achievement.metadata?.points || 0} pts
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Achievement Progress */}
      {achievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Progress Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(1).map((category) => {
              const categoryAchievements = achievements.filter(a => a.type === category.value)
              const maxPossible = 10 // Mock max achievements per category
              const progress = (categoryAchievements.length / maxPossible) * 100
              
              return (
                <div key={category.value} className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center">
                    <ApperIcon name={category.icon} size={24} className="text-gray-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{category.label}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {categoryAchievements.length} of {maxPossible}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Achievements