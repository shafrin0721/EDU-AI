import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AppIcon from "@/components/AppIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import StatCard from "@/components/molecules/StatCard";
import { courseService } from "@/services/api/courseService";
import { enrollmentService } from "@/services/api/enrollmentService";
import userService from "@/services/api/userService";
import assessmentService from "@/services/api/assessmentService";
import learningSessionService from "@/services/api/learningSessionService";
import Courses from "@/components/pages/Courses";
import Dashboard from "@/components/pages/Dashboard";
import Students from "@/components/pages/Students";
import Progress from "@/components/pages/Progress";

const TeacherDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (user) {
      loadTeacherData();
    }
  }, [user]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Load courses taught by this teacher
      const courseData = await courseService.getAll();
      const teacherCourses = courseData.filter(course => course.InstructorId === user.Id);
      setCourses(teacherCourses);

      if (teacherCourses.length > 0) {
        // Load enrollments for teacher's courses
        const enrollmentData = await enrollmentService.getAll();
        const relevantEnrollments = enrollmentData.filter(enrollment =>
          teacherCourses.some(course => course.Id === enrollment.CourseId)
        );
        setEnrollments(relevantEnrollments);

        // Load student data
        const userData = await userService.getAll();
        const enrolledStudents = userData.filter(u => 
          u.Role === 'student' && 
          relevantEnrollments.some(e => e.UserId === u.Id)
        );
        setStudents(enrolledStudents);

        // Load assessments
        const assessmentData = await assessmentService.getAll();
        const courseAssessments = assessmentData.filter(assessment =>
          teacherCourses.some(course => course.Id === assessment.CourseId)
        );
        setAssessments(courseAssessments);

        // Load learning sessions
        const sessionData = await learningSessionService.getAll();
        const courseSessions = sessionData.filter(session =>
          teacherCourses.some(course => course.Id === session.CourseId)
        );
        setSessions(courseSessions);
      }
      
    } catch (error) {
      console.error('Error loading teacher data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalStudents = new Set(enrollments.map(e => e.UserId)).size;
    const totalEnrollments = enrollments.length;
    
    const completedEnrollments = enrollments.filter(e => e.Progress === 100).length;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    
    const completedAssessments = assessments.filter(a => a.Status === 'completed');
    const averageScore = completedAssessments.length > 0 
      ? Math.round(completedAssessments.reduce((sum, a) => sum + a.Score, 0) / completedAssessments.length)
      : 0;

    return { totalStudents, completionRate, averageScore, totalCourses: courses.length };
  };

  const getCourseStats = (course) => {
    const courseEnrollments = enrollments.filter(e => e.CourseId === course.Id);
    const completed = courseEnrollments.filter(e => e.Progress === 100).length;
    const averageProgress = courseEnrollments.length > 0 
      ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.Progress, 0) / courseEnrollments.length)
      : 0;
    
    return {
      enrolled: courseEnrollments.length,
      completed,
      averageProgress
    };
  };

  const getRecentActivity = () => {
    return sessions
      .sort((a, b) => new Date(b.StartTime) - new Date(a.StartTime))
      .slice(0, 5)
      .map(session => {
        const student = students.find(s => s.Id === session.UserId);
        const course = courses.find(c => c.Id === session.CourseId);
        return { ...session, student, course };
      });
  };

  if (loading) return <Loading />;

  const stats = calculateStats();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard 👨‍🏫
            </h1>
            <p className="text-gray-600">Manage your courses and track student progress</p>
          </div>
          
<div className="flex space-x-3">
            <Button
              onClick={() => navigate('/courses/create')}
              icon="Plus"
              size="lg"
            >
              Create Course
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/classes')}
              icon="Users"
              size="lg"
            >
              My Classes
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon="BookOpen"
            trend={stats.totalCourses > 0 ? 'up' : 'neutral'}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
          />
          
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon="Users"
            trend={stats.totalStudents > 0 ? 'up' : 'neutral'}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
          />
          
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon="Target"
            trend={stats.completionRate >= 70 ? 'up' : stats.completionRate >= 50 ? 'neutral' : 'down'}
            className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200"
          />
          
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon="Award"
            trend={stats.averageScore >= 80 ? 'up' : stats.averageScore >= 60 ? 'neutral' : 'down'}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <AppIcon name="BookOpen" size={20} className="mr-2" />
                    My Courses ({courses.length})
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/courses/create')}
                    icon="Plus"
                  >
                    New Course
                  </Button>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <AppIcon name="BookOpen" size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                    <p className="text-gray-600">Create your first course to start teaching!</p>
                    <Button onClick={() => navigate('/courses/create')} icon="Plus">
                      Create Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course, index) => {
                      const courseStats = getCourseStats(course);
                      
                      return (
                        <motion.div
                          key={course.Id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">{course.Title}</h3>
                                <Badge variant={course.Status === 'published' ? 'success' : 'warning'}>
                                  {course.Status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {course.Description}
                              </p>
                              
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-semibold text-blue-600">
                                    {courseStats.enrolled}
                                  </div>
                                  <div className="text-xs text-gray-500">Enrolled</div>
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-green-600">
                                    {courseStats.completed}
                                  </div>
                                  <div className="text-xs text-gray-500">Completed</div>
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-purple-600">
                                    {courseStats.averageProgress}%
                                  </div>
                                  <div className="text-xs text-gray-500">Avg Progress</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-4 flex flex-col space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/courses/${course.Id}/edit`)}
                                icon="Edit"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCourse(course)}
                                icon="Users"
                              >
                                Students
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Recent Student Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <AppIcon name="Activity" size={20} className="mr-2" />
                  Recent Student Activity
                </h2>

                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <AppIcon name="Clock" size={16} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.Id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {activity.student?.FirstName?.[0] || '?'}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.student?.FirstName} {activity.student?.LastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {activity.CompletionStatus === 'completed' ? 'Completed' : 'Started'} module in {activity.course?.Title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.StartTime).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {activity.CompletionStatus === 'completed' && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Complete
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AppIcon name="Zap" size={16} className="mr-2" />
                  Quick Actions
                </h3>
                
<div className="space-y-3">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate('/courses/create')}
                      icon="Plus"
                    >
                      Create New Course
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate('/classes')}
                      icon="Users"
                    >
                      Manage Classes
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/students')}
                    icon="Users"
                  >
                    View All Students
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/analytics')}
                    icon="BarChart"
                  >
                    Course Analytics
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/assessments')}
                    icon="CheckSquare"
                  >
                    Manage Assessments
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Top Students */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AppIcon name="Trophy" size={16} className="mr-2" />
                  Top Performers
                </h3>

                {students.length === 0 ? (
                  <div className="text-center py-4 space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <AppIcon name="Users" size={16} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">No students yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.slice(0, 5).map((student, index) => {
                      const studentEnrollments = enrollments.filter(e => e.UserId === student.Id);
                      const averageProgress = studentEnrollments.length > 0
                        ? Math.round(studentEnrollments.reduce((sum, e) => sum + e.Progress, 0) / studentEnrollments.length)
                        : 0;

                      return (
                        <motion.div
                          key={student.Id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {student.FirstName?.[0]}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {student.FirstName} {student.LastName}
                            </p>
                            <div className="flex items-center space-x-2">
                              <ProgressBar value={averageProgress} className="flex-1" />
                              <span className="text-xs text-gray-500">{averageProgress}%</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 ai-card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AppIcon name="Lightbulb" size={16} className="mr-2 text-purple-600" />
                  Teaching Tips
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>💡 Create engaging content with multimedia elements</p>
                  <p>📊 Monitor student progress regularly</p>
                  <p>💬 Provide timely feedback on assignments</p>
                  <p>🎯 Set clear learning objectives for each module</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
