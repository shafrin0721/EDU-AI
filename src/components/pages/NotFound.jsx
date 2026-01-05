import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="text-9xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            404
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 transform translate-x-4 -translate-y-4"
          >
            <ApperIcon name="BookX" size={48} className="text-red-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
<h1 className="text-3xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Looks like this learning path doesn't exist. Let's get you back on track with your education journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Button
            onClick={() => navigate("/")}
            variant="primary"
            size="lg"
            icon="Home"
          >
            Back to Dashboard
          </Button>
          
          <Button
            onClick={() => navigate("/courses")}
            variant="outline"
            size="lg"
            icon="BookOpen"
          >
            Browse Courses
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pt-8 border-t border-gray-200"
        >
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center justify-center space-x-2 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ApperIcon name="Home" size={16} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => navigate("/courses")} 
              className="flex items-center justify-center space-x-2 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ApperIcon name="BookOpen" size={16} />
              <span>Courses</span>
            </button>
            <button 
              onClick={() => navigate("/progress")} 
              className="flex items-center justify-center space-x-2 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ApperIcon name="TrendingUp" size={16} />
              <span>Progress</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs text-gray-400"
        >
          Lost? Our AI can help guide you back! 🤖
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound