import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const ErrorView = ({ 
  message = "Something went wrong", 
  onRetry, 
  className = "",
  showRetry = true 
}) => {
  return (
    <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
        >
          <ApperIcon 
            name="AlertCircle" 
            size={32} 
            className="text-red-600" 
          />
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        {showRetry && onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="RefreshCw" size={18} />
            <span>Try Again</span>
          </motion.button>
        )}

        <div className="text-xs text-gray-400">
          If this problem persists, please contact support
        </div>
      </div>
    </div>
  )
}

export default ErrorView