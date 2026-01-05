import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";
import Loading from "@/components/ui/Loading";

// Authentication components
const Login = lazy(() => import("@/components/pages/Login"));
const Register = lazy(() => import("@/components/pages/Register"));

// Protected page components
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Courses = lazy(() => import("@/components/pages/Courses"));
const Progress = lazy(() => import("@/components/pages/Progress"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const Achievements = lazy(() => import("@/components/pages/Achievements"));
const Recommendations = lazy(() => import("@/components/pages/Recommendations"));
const ModuleDetail = lazy(() => import("@/components/pages/ModuleDetail"));

// Role-based dashboard components
const CourseDetail = lazy(() => import("@/components/pages/CourseDetail"));
const ContentLibrary = lazy(() => import("@/components/pages/ContentLibrary"));
const Students = lazy(() => import("@/components/pages/Students"));
const Users = lazy(() => import("@/components/pages/Users"));
const Settings = lazy(() => import("@/components/pages/Settings"));
const Billing = lazy(() => import("@/components/pages/Billing"));
const Profile = lazy(() => import("@/components/pages/Profile"));
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

// Authentication routes (public)
const authRoutes = [
  {
    path: "login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: "register", 
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Register />
      </Suspense>
    )
  }
]

// Protected routes configuration
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
  // Student Routes
  {
    path: "courses",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Courses />
      </Suspense>
    )
},
{
    path: "courses/:courseId", 
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CourseDetail />
      </Suspense>
    )
  },
  {
    path: "modules/:moduleId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ModuleDetail />
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
    path: "achievements",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Achievements />
      </Suspense>
    )
  },
  {
    path: "recommendations",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Recommendations />
      </Suspense>
    )
  },
  // Teacher Routes
{
path: "content",
element: (
<Suspense fallback={<LoadingFallback />}>
<ContentLibrary />
</Suspense>
)
  },
  {
    path: "students",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Students />
      </Suspense>
    )
  },
  // Admin Routes
  {
    path: "users",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Users />
      </Suspense>
    )
  },
  {
    path: "settings",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Settings />
      </Suspense>
    )
  },
  {
    path: "billing",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Billing />
      </Suspense>
    )
  },
  // Shared Routes
  {
    path: "profile",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Profile />
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
  // Authentication routes (public)
  ...authRoutes,
  // Protected routes (require authentication)
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);