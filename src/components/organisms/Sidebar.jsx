import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"
import NavigationItem from "@/components/molecules/NavigationItem"
import { toggleSidebar } from "@/store/slices/dashboardSlice"

const Sidebar = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { sidebarCollapsed } = useSelector(state => state.dashboard)

  const getNavigationItems = () => {
    const baseItems = [
      { to: "", icon: "Home", label: "Dashboard" }
    ]

    switch (user?.role) {
      case "student":
        return [
          ...baseItems,
          { to: "courses", icon: "BookOpen", label: "My Courses" },
          { to: "progress", icon: "TrendingUp", label: "Progress" },
          { to: "achievements", icon: "Award", label: "Achievements" },
          { to: "recommendations", icon: "Lightbulb", label: "Recommendations", badge: "AI" }
        ]
      case "teacher":
        return [
          ...baseItems,
          { to: "classes", icon: "Users", label: "My Classes" },
          { to: "content", icon: "FileText", label: "Content Library" },
          { to: "analytics", icon: "BarChart", label: "Analytics" },
          { to: "students", icon: "GraduationCap", label: "Students" }
        ]
      case "admin":
        return [
          ...baseItems,
          { to: "users", icon: "Users", label: "User Management" },
          { to: "courses", icon: "BookOpen", label: "Course Management" },
          { to: "analytics", icon: "BarChart3", label: "System Analytics" },
          { to: "settings", icon: "Settings", label: "Settings" },
          { to: "billing", icon: "CreditCard", label: "Billing" }
        ]
      default:
        return baseItems
    }
  }

  // Desktop sidebar (static)
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center justify-between p-4">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  EduAI
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ApperIcon 
              name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} 
              size={16} 
            />
          </button>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
          {getNavigationItems().map((item) => (
            <NavigationItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              badge={item.badge}
              collapsed={sidebarCollapsed}
            >
              {item.label}
            </NavigationItem>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            "flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50",
            sidebarCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Zap" size={16} className="text-white" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900">AI Powered</p>
                  <p className="text-xs text-gray-500">Smart Recommendations</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile sidebar (overlay)
  const MobileSidebar = () => (
    <div className="lg:hidden">
      <AnimatePresence>
        {!sidebarCollapsed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => dispatch(toggleSidebar())}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="GraduationCap" size={20} className="text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    EduAI
                  </h1>
                </div>
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {getNavigationItems().map((item) => (
                  <NavigationItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    badge={item.badge}
                    collapsed={false}
                  >
                    {item.label}
                  </NavigationItem>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                    <ApperIcon name="Zap" size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">AI Powered</p>
                    <p className="text-xs text-gray-500">Smart Recommendations</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
}

export default Sidebar