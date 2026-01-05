import { createBrowserRouter } from "react-router-dom"
import { Suspense, lazy } from "react"
import Layout from "@/components/organisms/Layout"

// Lazy load all page components
const Dashboard = lazy(() => import("@/components/pages/Dashboard"))
const Courses = lazy(() => import("@/components/pages/Courses"))
const Progress = lazy(() => import("@/components/pages/Progress"))
const NotFound = lazy(() => import("@/components/pages/NotFound"))

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-gray-600">Loading EduAI...</p>
    </div>
  </div>
)

// Main routes configuration
const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Dashboard />
      </Suspense>
    )
  },
  {
    path: "courses",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Courses />
      </Suspense>
    )
  },
  {
    path: "progress",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Progress />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    )
  }
]

// Create router configuration
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
]

export const router = createBrowserRouter(routes)