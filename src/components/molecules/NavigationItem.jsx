import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/utils/cn"
import AppIcon from "@/components/AppIcon"

const NavigationItem = ({ 
  to, 
  icon, 
  children, 
  badge,
  collapsed = false,
  className 
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group",
          isActive 
            ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-r-2 border-primary-600" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
          collapsed && "justify-center px-2",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative">
            <AppIcon 
              name={icon} 
              size={20} 
              className={cn(
                "transition-colors duration-200",
                isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"
              )}
            />
            {badge && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </div>
          
          {!collapsed && (
            <motion.span
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {children}
            </motion.span>
          )}
          
          {badge && !collapsed && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {children}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

export default NavigationItem