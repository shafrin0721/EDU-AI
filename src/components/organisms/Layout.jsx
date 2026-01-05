import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { useSelector, useDispatch } from "react-redux"
import { restoreAuth } from "@/store/slices/authSlice"
import Header from "./Header"
import Sidebar from "./Sidebar"

const Layout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  // Restore authentication from localStorage on app load
  useEffect(() => {
    const savedAuth = localStorage.getItem('eduai_auth')
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth)
        if (authData.isAuthenticated && authData.user) {
          dispatch(restoreAuth(authData))
          return
        }
      } catch (error) {
        // Invalid saved auth data
        localStorage.removeItem('eduai_auth')
      }
    }
    
    // If no valid auth, redirect to login
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate, dispatch])

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return null
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getPageTitle()} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-[9999]"
      />
    </div>
  )
}

export default Layout