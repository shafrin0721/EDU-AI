import { motion } from "framer-motion"
import AppIcon from "@/components/AppIcon"

const Empty = ({ 
  title = "No data found",
  description = "There's nothing here yet. Get started by adding some content.",
  icon = "Folder",
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`min-h-[300px] flex items-center justify-center ${className}`}>
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center"
        >
          <AppIcon 
            name={icon} 
            size={32} 
            className="text-gray-400" 
          />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="space-y-2"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            {description}
          </p>
        </motion.div>

        {actionLabel && onAction && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAction}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <AppIcon name="Plus" size={18} />
            <span>{actionLabel}</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default Empty