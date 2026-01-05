import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/atoms/ProgressBar";
import React from "react";
import Progress from "@/components/pages/Progress";
import Button from "@/components/atoms/Button";

const CourseCard = ({ 
  course, 
  progress, 
  className,
  showProgress = true,
  variant = "default",
  showEnrollButton = false,
  onEnroll = null
}) => {
  const navigate = useNavigate()

  const handleCourseClick = () => {
    navigate(`/courses/${course.Id}`)
  }

return (
    <Card 
      hoverable 
      className={cn(
        "cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group",
        "border border-gray-200 hover:border-primary-300",
        className
      )}
      onClick={handleCourseClick}
    >
      <div className="relative">
        {/* Course Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
          <img
            src={course.metadata?.thumbnail || "/api/placeholder/400/200"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={
                course.difficulty === "beginner" ? "success" :
                course.difficulty === "intermediate" ? "warning" : "danger"
              }
              size="sm"
            >
              {course.difficulty}
            </Badge>
          </div>
          
{/* Progress Overlay */}
{showProgress && progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-xs font-medium">Progress</span>
                <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
              </div>
              <ProgressBar 
                value={progress} 
                color="accent"
                size="sm"
                animated={false}
                className="bg-white/20"
              />
            </div>
          )}
        </div>
      </div>
      
<div className="p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
            {course.title || course.Title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {course.description || course.Description}
          </p>
        </div>
        
        {/* Course Metadata */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <ApperIcon name="Clock" size={14} className="text-primary-500" />
              <span className="font-medium">{Math.round((course.metadata?.duration || 300) / 60)}h</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <ApperIcon name="Users" size={14} className="text-primary-500" />
              <span className="font-medium">{course.metadata?.enrollmentCount || 0}</span>
            </div>
          </div>
          
          {showProgress && progress !== undefined && (
            <div className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-bold">
              {Math.round(progress)}%
            </div>
          )}
        </div>
        
        {/* Progress Bar for enrolled courses */}
        {showProgress && progress !== undefined && !showEnrollButton && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Course Progress</span>
              <span className="text-primary-600 font-semibold">{Math.round(progress)}% Complete</span>
            </div>
            <ProgressBar 
              value={progress} 
              color="primary"
              size="sm"
              className="h-2"
            />
          </div>
        )}

        {/* Course Tags */}
        {course.metadata?.tags && (
          <div className="flex flex-wrap gap-2 pt-2">
            {course.metadata.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                size="sm"
                className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
              >
                {tag}
              </Badge>
            ))}
            {course.metadata.tags.length > 3 && (
              <Badge variant="outline" size="sm" className="text-gray-500">
                +{course.metadata.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Enroll Button */}
        {showEnrollButton && onEnroll && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEnroll(course.Id || course.id);
            }}
            className="w-full mt-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all duration-200"
            icon="Play"
          >
            Start Learning
          </Button>
        )}
      </div>
    </Card>
  )
}

export default CourseCard