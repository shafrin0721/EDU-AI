import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import CourseCard from "@/components/molecules/CourseCard";
import SearchBar from "@/components/molecules/SearchBar";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import AppIcon from "@/components/AppIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import courseService from "@/services/api/courseService";
import enrollmentService from "@/services/api/enrollmentService";

const Courses = () => {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const filters = [
    { value: "all", label: "All Courses" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ]

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError("")

      if (user?.role === "student") {
        const [enrollmentsData, allCourses] = await Promise.all([
          enrollmentService.getByStudent(user.Id.toString()),
          courseService.getAll()
        ])
        setEnrollments(enrollmentsData)
        setCourses(allCourses)
      } else if (user?.role === "teacher") {
        const coursesData = await courseService.getByTeacher(user.Id.toString())
        setCourses(coursesData)
      } else if (user?.role === "admin") {
        const coursesData = await courseService.getAll()
        setCourses(coursesData)
      }
    } catch (err) {
      setError(err.message || "Failed to load courses")
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = (searchTerm, filter) => {
    let filtered = courses

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (filter !== "all") {
      if (filter === "active") {
        filtered = filtered.filter(course => 
          enrollments.some(e => e.courseId === course.Id.toString() && e.status === "active")
        )
      } else if (filter === "completed") {
        filtered = filtered.filter(course => 
          enrollments.some(e => e.courseId === course.Id.toString() && e.status === "completed")
        )
      } else {
        filtered = filtered.filter(course => course.difficulty === filter)
      }
    }

    setFilteredCourses(filtered)
  }

  const handleSearch = (searchTerm, filter) => {
    setSearchTerm(searchTerm)
    setSelectedFilter(filter)
    filterCourses(searchTerm, filter)
  }

const handleEnroll = async (courseId) => {
    try {
      await enrollmentService.create({
        studentId: user.Id.toString(),
        courseId: courseId.toString()
      })
      toast.success("Successfully enrolled in course!")
      loadCourses()
    } catch (err) {
      toast.error("Failed to enroll in course")
    }
  }

  const handleEditCourse = (courseId) => {
    navigate(`/courses/${courseId}/edit`)
    toast.info("Opening course editor...")
  }

  const handleCourseMenu = (courseId) => {
    toast.info("Course options menu")
  }

  const getEnrollmentForCourse = (courseId) => {
    return enrollments.find(e => e.courseId === courseId.toString())
  }

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.courseId === courseId.toString())
  }

  useEffect(() => {
    if (user?.Id) {
      loadCourses()
    }
  }, [user])

  useEffect(() => {
    filterCourses(searchTerm, selectedFilter)
  }, [courses, enrollments])

  const handleRetry = () => {
    loadCourses()
  }

  if (loading) return <Loading variant="skeleton" />
  if (error) return <ErrorView message={error} onRetry={handleRetry} />

  // Student View
  if (user?.role === "student") {
    const activeCourses = filteredCourses.filter(course => 
      enrollments.some(e => e.courseId === course.Id.toString() && e.status === "active")
    )
    const availableCourses = filteredCourses.filter(course => 
      !enrollments.some(e => e.courseId === course.Id.toString())
    )
    const completedCourses = filteredCourses.filter(course => 
      enrollments.some(e => e.courseId === course.Id.toString() && e.status === "completed")
    )

    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Continue your learning journey</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="primary">{enrollments.length} Enrolled</Badge>
            <Badge variant="success">{completedCourses.length} Completed</Badge>
          </div>
        </div>

        <SearchBar
          placeholder="Search courses..."
          onSearch={handleSearch}
          showFilter={true}
          filters={filters}
          className="max-w-2xl"
        />

        {/* Active Courses */}
        {activeCourses.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map((course) => {
                const enrollment = getEnrollmentForCourse(course.Id)
return (
                  <motion.div
                    key={course.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <CourseCard
                      course={course}
                      progress={enrollment?.progress}
                      showProgress={true}
                      className="h-full flex flex-col"
                    />
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
<motion.div
                  key={course.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <CourseCard
                    course={course}
                    showProgress={false}
                    showEnrollButton={true}
                    onEnroll={handleEnroll}
                    className="h-full flex flex-col border-2 border-dashed border-primary-200 hover:border-primary-400 bg-gradient-to-br from-primary-25 to-blue-25"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => {
                const enrollment = getEnrollmentForCourse(course.Id)
                return (
<motion.div
                    key={course.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full relative"
                  >
                    <CourseCard
                      course={course}
                      progress={enrollment?.progress}
                      showProgress={true}
                      className="h-full flex flex-col border-2 border-green-200 bg-gradient-to-br from-green-25 to-emerald-25"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="success" size="sm" className="bg-green-600 text-white shadow-lg">
                        <AppIcon name="CheckCircle" size={12} className="mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {filteredCourses.length === 0 && (
          <Empty
            title="No courses found"
            description="Try adjusting your search or filter criteria"
            icon="BookOpen"
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchTerm("")
              setSelectedFilter("all")
              filterCourses("", "all")
            }}
          />
        )}
      </div>
    )
  }

  // Teacher/Admin View (Course Management)
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === "teacher" ? "My Courses" : "Course Management"}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === "teacher" ? "Manage your course content" : "Manage all platform courses"}
          </p>
        </div>
        {user?.role === "teacher" && (
          <Button variant="primary" icon="Plus">
            Create Course
          </Button>
        )}
      </div>

      <SearchBar
        placeholder="Search courses..."
        onSearch={handleSearch}
        showFilter={true}
filters={filters}
        className="max-w-2xl"
      />

      {filteredCourses.length === 0 ? (
        <Empty
          title="No courses found"
          description={user?.role === "teacher" ? "Start by creating your first course" : "No courses match your criteria"}
          icon="BookOpen"
          actionLabel={user?.role === "teacher" ? "Create Course" : "Reset Filters"}
          onAction={() => {
            if (user?.role === "teacher") {
              toast.info("Navigate to course creation")
            } else {
              setSearchTerm("")
              setSelectedFilter("all")
              filterCourses("", "all")
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card hoverable>
                <div className="aspect-video bg-gradient-to-br from-primary-50 to-secondary-50">
                  <img
                    src={course.metadata?.thumbnail || "/api/placeholder/300/200"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <Badge 
                      variant={course.isPublished ? "success" : "warning"}
                      size="sm"
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <AppIcon name="Users" size={14} />
                        <span>{course.metadata?.enrollmentCount || 0}</span>
                      </div>
                      <Badge variant={course.difficulty === "beginner" ? "success" : course.difficulty === "intermediate" ? "warning" : "danger"} size="sm">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
<div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditCourse(course.Id)}
                    >
                      <AppIcon name="Edit" size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCourseMenu(course.Id)}
                    >
                      <AppIcon name="MoreVertical" size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Courses
