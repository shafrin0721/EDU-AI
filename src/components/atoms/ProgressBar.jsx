import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  className,
  color = "primary",
  size = "default",
  animated = true,
  showLabel = false,
  label
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colors = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600",
    secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600", 
    accent: "bg-gradient-to-r from-accent-500 to-accent-600",
    success: "bg-gradient-to-r from-green-500 to-green-600",
    warning: "bg-gradient-to-r from-amber-500 to-amber-600",
    danger: "bg-gradient-to-r from-red-500 to-red-600"
  }
  
  const sizes = {
    sm: "h-1",
    default: "h-2", 
    lg: "h-3"
  }

  return (
    <div className={cn("space-y-1", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="text-gray-900 font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("bg-gray-200 rounded-full overflow-hidden", sizes[size])}>
        {animated ? (
          <motion.div
            className={cn("rounded-full", colors[color], sizes[size])}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ) : (
          <div
            className={cn("rounded-full", colors[color], sizes[size])}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  )
}

export default ProgressBar