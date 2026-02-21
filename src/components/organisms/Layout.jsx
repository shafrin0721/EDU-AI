import { useEffect, useState, useLayoutEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { restoreAuth } from "@/store/slices/authSlice"
import Header from "./Header"
import Sidebar from "./Sidebar"
import Loading from "@/components/ui/Loading"

const Layout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { mode: theme } = useSelector(state => state.theme)
  const [isLoading, setIsLoading] = useState(true)

  // Restore authentication from localStorage on app load
  useLayoutEffect(() => {
    const savedAuth = localStorage.getItem('eduai_auth')
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth)
        if (authData.isAuthenticated && authData.user) {
          dispatch(restoreAuth(authData))
        }
      } catch (error) {
        localStorage.removeItem('eduai_auth')
      }
    }
    setIsLoading(false)
  }, [dispatch])

  // Apply theme to HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Redirect to login if not authenticated - use useEffect with proper dependency
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  // Show loading while checking auth
  if (isLoading) {
    return <Loading />
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user) {
    return <Loading />
  }
  
  const getPageTitle = () => {
    switch (user?.role) {
      case "student":
        return "Learning Dashboard"
      case "teacher":
        return "Teaching Dashboard"
      case "admin":
        return "Admin Dashboard"
      default:
        return "EduAI Platform"
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getPageTitle()} />
          
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
