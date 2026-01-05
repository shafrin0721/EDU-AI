import { motion } from "framer-motion"

const Loading = ({ className = "", variant = "default" }) => {
  if (variant === "skeleton") {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="shimmer h-6 w-24 rounded-lg mb-4"></div>
              <div className="shimmer h-12 w-16 rounded-lg mb-2"></div>
              <div className="shimmer h-4 w-32 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="shimmer h-6 w-48 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="shimmer h-10 w-10 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-48 rounded"></div>
                  <div className="shimmer h-3 w-24 rounded"></div>
                </div>
                <div className="shimmer h-8 w-16 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mx-auto"
        >
          <div className="h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Loading EduAI</h3>
          <p className="text-sm text-gray-500">Personalizing your learning experience...</p>
        </div>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-primary-600 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Loading