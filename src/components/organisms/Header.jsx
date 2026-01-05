import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { toggleSidebar } from "@/store/slices/dashboardSlice";
import { logout } from "@/store/slices/authSlice";
import Settings from "@/components/pages/Settings";
import Profile from "@/components/pages/Profile";

const Header = ({ title, className }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, organization } = useSelector(state => state.auth)
  const { notifications } = useSelector(state => state.dashboard)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className={cn("bg-white border-b border-gray-200 px-6 py-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="Menu" size={20} />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
            </h1>
            {organization && (
              <p className="text-sm text-gray-500">
                {organization.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <ApperIcon name="Bell" size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <ApperIcon name="Bell" size={24} className="mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-1 bg-primary-100 rounded-full">
                              <ApperIcon 
                                name={notification.icon || "Info"} 
                                size={14} 
                                className="text-primary-600" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img
                src={user?.profile?.avatar || "/api/placeholder/32/32"}
                alt={`${user?.profile?.firstName} ${user?.profile?.lastName}`}
                className="w-8 h-8 rounded-full border-2 border-primary-200"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <ApperIcon name="ChevronDown" size={16} className="text-gray-400" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-2">
                    <a href="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <ApperIcon name="User" size={16} />
                      <span className="text-sm">Profile</span>
                    </a>
<button onClick={() => navigate('/settings')} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left">
                     <ApperIcon name="Settings" size={16} />
                     <span>Settings</span>
                   </button>
                    <hr className="my-2" />
                    <button 
                      onClick={() => {
                        dispatch(logout())
                        window.location.href = '/login'
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                    >
                      <ApperIcon name="LogOut" size={16} />
                      <span className="text-sm">Sign out</span>
                    </button>
</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header