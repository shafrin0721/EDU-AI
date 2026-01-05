import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { useSelector } from "react-redux"
import Header from "./Header"
import Sidebar from "./Sidebar"

const Layout = () => {
  const { user } = useSelector(state => state.auth)
  
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