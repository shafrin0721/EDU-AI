import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import React from "react";

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
    primary: "bg-gradient-to-br from-primary-500 to-primary-600 text-white",
    secondary: "bg-gradient-to-br from-secondary-500 to-secondary-600 text-white",
    accent: "bg-gradient-to-br from-accent-500 to-accent-600 text-white",
    success: "bg-gradient-to-br from-green-500 to-green-600 text-white",
    warning: "bg-gradient-to-br from-amber-500 to-amber-600 text-white",
    danger: "bg-gradient-to-br from-red-500 to-red-600 text-white"
  }

  const trendColors = {
    up: "bg-green-100 text-green-800",
    down: "bg-red-100 text-red-800",
    neutral: "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-gray-200 shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded shimmer" />
            <div className="h-6 bg-gray-200 rounded shimmer w-20" />
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