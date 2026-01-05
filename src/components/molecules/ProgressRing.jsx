import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

const ProgressRing = ({ 
  value = 0, 
  max = 100, 
  size = 120, 
  strokeWidth = 8,
  color = "primary",
  showValue = true,
  label,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const colors = {
    primary: "#4F46E5",
    secondary: "#7C3AED", 
    accent: "#F59E0B",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444"
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="progress-ring"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-bold text-gray-900"
          >
            {Math.round(percentage)}%
          </motion.span>
          {label && (
            <span className="text-xs text-gray-500 text-center mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProgressRing