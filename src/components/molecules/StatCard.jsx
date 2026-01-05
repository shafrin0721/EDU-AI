import { motion } from "framer-motion"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendValue,
  color = "primary",
  className,
  loading = false
}) => {
  const colors = {
    primary: "text-primary-600 bg-primary-50",
    secondary: "text-secondary-600 bg-secondary-50",
    accent: "text-accent-600 bg-accent-50", 
    success: "text-green-600 bg-green-50",
    warning: "text-amber-600 bg-amber-50",
    danger: "text-red-600 bg-red-50"
  }
  
  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50"
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center space-x-4">
          <div className="shimmer w-12 h-12 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 w-24 rounded"></div>
            <div className="shimmer h-8 w-16 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card hoverable className={cn("p-6", className)}>
      <div className="flex items-center space-x-4">
        <div className={cn("p-3 rounded-lg", colors[color])}>
          <ApperIcon name={icon} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-gray-900"
            >
              {value}
            </motion.p>
            {trend && trendValue && (
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                trendColors[trend]
              )}>
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"} 
                  size={12} 
                />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default StatCard