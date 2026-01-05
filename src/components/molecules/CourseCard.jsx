import { motion } from "framer-motion"
import { cn } from "@/utils/cn"
import { useNavigate } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import ProgressBar from "@/components/atoms/ProgressBar"

const CourseCard = ({ 
  course, 
  progress, 
  className,
  showProgress = true,
  variant = "default"
}) => {
  const navigate = useNavigate()
  
  const difficultyColors = {
    beginner: "success",
    intermediate: "warning", 
    advanced: "danger"
  }

  const handleCardClick = () => {
    navigate(`/learning/${course.Id}`)
  }

  return (
    <Card 
      hoverable 
      className={cn("cursor-pointer overflow-hidden", className)}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
          <img
            src={course.metadata?.thumbnail || "/api/placeholder/300/200"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge variant={difficultyColors[course.difficulty]} size="sm">
              {course.difficulty}
            </Badge>
          </div>
          {showProgress && progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <ProgressBar 
                value={progress} 
                color="accent"
                size="sm"
                animated={false}
                className="mb-2"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {course.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ApperIcon name="Clock" size={14} />
              <span>{Math.round(course.metadata?.duration / 60)} hours</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="Users" size={14} />
              <span>{course.metadata?.enrollmentCount}</span>
            </div>
          </div>
          
          {showProgress && progress !== undefined && (
            <div className="text-primary-600 font-medium">
              {Math.round(progress)}%
            </div>
          )}
        </div>
        
        {course.metadata?.tags && (
          <div className="flex flex-wrap gap-1">
            {course.metadata.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default CourseCard