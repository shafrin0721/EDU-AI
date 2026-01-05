import { useSelector } from "react-redux";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";
import Loading from "@/components/ui/Loading";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Empty from "@/components/ui/Empty";
import Achievements from "@/components/pages/Achievements";
import Courses from "@/components/pages/Courses";
import Progress from "@/components/pages/Progress";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressRing from "@/components/molecules/ProgressRing";
import StatCard from "@/components/molecules/StatCard";

const Dashboard = () => {
  const { user, loading } = useSelector(state => state.auth);
  
  if (loading) return <Loading />;

  // Redirect to appropriate dashboard based on user role
  switch (user?.Role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />; // Default to student dashboard
  }
}

  // Teacher Dashboard
  if (user?.role === "teacher") {
    const publishedCourses = courses.filter(c => c.isPublished)
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.metadata?.enrollmentCount || 0), 0)

    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Teaching Dashboard 📚
          </h2>
          <p className="text-secondary-100 text-lg">
            Manage your courses and track student progress
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Courses"
            value={publishedCourses.length}
            icon="BookOpen"
            color="primary"
          />
          <StatCard
            title="Total Students"
            value={totalEnrollments}
            icon="Users"
            color="success"
          />
          <StatCard
            title="Course Rating"
            value="4.3"
            icon="Star"
            color="accent"
          />
          <StatCard
            title="Completion Rate"
            value="73%"
            icon="TrendingUp"
            color="secondary"
          />
        </div>

        {/* Course Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">My Courses</h3>
              <Button variant="primary" size="sm" icon="Plus">
                Create Course
              </Button>
            </div>
            
            {courses.length === 0 ? (
              <Empty
                title="No courses created"
                description="Start by creating your first course"
                icon="BookOpen"
                actionLabel="Create Course"
                onAction={() => toast.info("Navigate to course creation")}
              />
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.metadata?.enrollmentCount || 0} students</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={course.isPublished ? "success" : "warning"}
                        size="sm"
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="MoreVertical" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Activity</h3>
            <div className="text-center py-8">
              <ApperIcon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Student analytics will appear here</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  if (user?.role === "admin") {
    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            System Administration ⚙️
          </h2>
          <p className="text-gray-300 text-lg">
            Monitor platform performance and manage users
          </p>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value="1,247"
            icon="Users"
            color="primary"
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Active Courses"
            value={courses.length}
            icon="BookOpen"
            color="success"
          />
          <StatCard
            title="Platform Usage"
            value="85%"
            icon="Activity"
            color="accent"
          />
          <StatCard
            title="Revenue"
            value="$42.3K"
            icon="DollarSign"
            color="secondary"
            trend="up"
            trendValue="8.1%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">System Health</h3>
            <div className="space-y-4">
              {[
                { label: "Server Uptime", value: "99.9%", status: "success" },
                { label: "AI Processing", value: "Normal", status: "success" },
                { label: "Database", value: "Optimal", status: "success" },
                { label: "CDN", value: "Active", status: "success" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="text-center py-8">
              <ApperIcon name="Activity" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Activity logs will appear here</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return <Empty title="Role not recognized" description="Please contact support" />
}

export default Dashboard