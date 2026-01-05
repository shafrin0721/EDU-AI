import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import StatCard from '@/components/molecules/StatCard';
import { userService } from '@/services/api/userService';
import { courseService } from '@/services/api/courseService';
import { enrollmentService } from '@/services/api/enrollmentService';
import { organizationService } from '@/services/api/organizationService';
import { learningSessionService } from '@/services/api/learningSessionService';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // week, month, year

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load all data
      const [userData, courseData, enrollmentData, orgData, sessionData] = await Promise.all([
        userService.getAll(),
        courseService.getAll(),
        enrollmentService.getAll(),
        organizationService.getAll(),
        learningSessionService.getAll()
      ]);

      setUsers(userData);
      setCourses(courseData);
      setEnrollments(enrollmentData);
      setOrganizations(orgData);
      setSessions(sessionData);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePlatformStats = () => {
    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.Role === 'student').length;
    const totalInstructors = users.filter(u => u.Role === 'teacher').length;
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.Status === 'published').length;
    
    // Calculate active users (users with recent sessions)
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
    const activeUserIds = new Set(
      sessions
        .filter(s => new Date(s.StartTime) >= cutoffDate)
        .map(s => s.UserId)
    );
    const activeUsers = activeUserIds.size;

    // Calculate completion rate
    const completedEnrollments = enrollments.filter(e => e.Progress === 100).length;
    const completionRate = enrollments.length > 0 
      ? Math.round((completedEnrollments / enrollments.length) * 100) 
      : 0;

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      activeUsers,
      completionRate,
      totalEnrollments: enrollments.length
    };
  };

  const getRecentActivity = () => {
    const recentSessions = sessions
      .sort((a, b) => new Date(b.StartTime) - new Date(a.StartTime))
      .slice(0, 10);

    return recentSessions.map(session => {
      const student = users.find(u => u.Id === session.UserId);
      const course = courses.find(c => c.Id === session.CourseId);
      return { ...session, student, course };
    });
  };

  const getPendingApprovals = () => {
    const pendingCourses = courses.filter(c => c.Status === 'pending');
    const pendingInstructors = users.filter(u => u.Role === 'teacher' && u.Status === 'pending');
    
    return { pendingCourses, pendingInstructors };
  };

  const handleUserAction = async (userId, action) => {
    try {
      const targetUser = users.find(u => u.Id === userId);
      if (!targetUser) return;

      let updatedStatus;
      switch (action) {
        case 'approve':
          updatedStatus = 'active';
          break;
        case 'suspend':
          updatedStatus = 'suspended';
          break;
        case 'activate':
          updatedStatus = 'active';
          break;
        default:
          return;
      }

      await userService.update(userId, { Status: updatedStatus });
      toast.success(`User ${action}d successfully`);
      loadAdminData();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleCourseAction = async (courseId, action) => {
    try {
      const course = courses.find(c => c.Id === courseId);
      if (!course) return;

      let updatedStatus;
      switch (action) {
        case 'approve':
          updatedStatus = 'published';
          break;
        case 'archive':
          updatedStatus = 'archived';
          break;
        case 'reject':
          updatedStatus = 'rejected';
          break;
        default:
          return;
      }

      await courseService.update(courseId, { Status: updatedStatus });
      toast.success(`Course ${action}d successfully`);
      loadAdminData();
    } catch (error) {
      console.error(`Error ${action}ing course:`, error);
      toast.error(`Failed to ${action} course`);
    }
  };

  if (loading) return <Loading />;

  const stats = calculatePlatformStats();
  const recentActivity = getRecentActivity();
  const { pendingCourses, pendingInstructors } = getPendingApprovals();

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
              Admin Dashboard 👨‍💼
            </h1>
            <p className="text-gray-600">Platform management and analytics overview</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 12 months</option>
            </select>
            
            <Button
              onClick={() => navigate('/admin/settings')}
              variant="outline"
              icon="Settings"
            >
              System Settings
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon="Users"
            subtitle={`${stats.activeUsers} active this week`}
            trend="up"
            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
          />
          
          <StatCard
            title="Published Courses"
            value={stats.publishedCourses}
            icon="BookOpen"
            subtitle={`${stats.totalCourses} total courses`}
            trend="up"
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
          />
          
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments.toLocaleString()}
            icon="UserPlus"
            subtitle={`${stats.completionRate}% completion rate`}
            trend={stats.completionRate >= 70 ? 'up' : 'neutral'}
            className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200"
          />
          
          <StatCard
            title="Pending Approvals"
            value={pendingCourses.length + pendingInstructors.length}
            icon="Clock"
            subtitle="Require attention"
            trend={pendingCourses.length + pendingInstructors.length > 0 ? 'down' : 'neutral'}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Approvals */}
            {(pendingCourses.length > 0 || pendingInstructors.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <ApperIcon name="AlertCircle" size={20} className="mr-2 text-orange-500" />
                    Pending Approvals
                  </h2>

                  <div className="space-y-4">
                    {/* Pending Instructors */}
                    {pendingInstructors.map((instructor, index) => (
                      <motion.div
                        key={`instructor-${instructor.Id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {instructor.FirstName?.[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {instructor.FirstName} {instructor.LastName}
                            </h3>
                            <p className="text-sm text-gray-600">Instructor Application</p>
                            <p className="text-xs text-gray-500">{instructor.Email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUserAction(instructor.Id, 'approve')}
                            icon="Check"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleUserAction(instructor.Id, 'suspend')}
                            icon="X"
                          >
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Pending Courses */}
                    {pendingCourses.map((course, index) => (
                      <motion.div
                        key={`course-${course.Id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * (pendingInstructors.length + index) }}
                        className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{course.Title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{course.Description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Category: {course.Category}</span>
                            <span>Level: {course.DifficultyLevel}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCourseAction(course.Id, 'approve')}
                            icon="Check"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCourseAction(course.Id, 'reject')}
                            icon="X"
                          >
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Platform Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ApperIcon name="BarChart" size={20} className="mr-2" />
                  Platform Analytics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                    <div className="text-sm text-gray-600">Students</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((stats.totalStudents / stats.totalUsers) * 100)}% of users
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.totalInstructors}</div>
                    <div className="text-sm text-gray-600">Instructors</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((stats.totalInstructors / stats.totalUsers) * 100)}% of users
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.totalEnrollments} total enrollments
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Platform Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ApperIcon name="Activity" size={20} className="mr-2" />
                  Recent Platform Activity
                </h2>

                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <ApperIcon name="Clock" size={16} className="text-gray-400" />
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
                            {activity.CompletionStatus === 'completed' ? 'Completed' : 'Started'} module in {activity.course?.Title || 'Unknown Course'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.StartTime).toLocaleString()}
                          </p>
                        </div>
                        
                        <Badge 
                          variant={activity.CompletionStatus === 'completed' ? 'success' : 'warning'}
                        >
                          {activity.CompletionStatus}
                        </Badge>
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
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="Zap" size={16} className="mr-2" />
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/users')}
                    icon="Users"
                  >
                    Manage Users
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/courses')}
                    icon="BookOpen"
                  >
                    Manage Courses
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
onClick={() => navigate('/analytics')}
                    icon="BarChart"
                  >
                    System Analytics
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/organizations')}
                    icon="Building"
                  >
                    Manage Organizations
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/settings')}
                    icon="Settings"
                  >
                    System Settings
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="Monitor" size={16} className="mr-2" />
                  System Status
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Platform Status</span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage</span>
                    <Badge variant="success">Available</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Services</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Platform Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 ai-card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="Brain" size={16} className="mr-2 text-purple-600" />
                  Platform Insights
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>📈 User engagement is up 15% this month</p>
                  <p>🎯 Course completion rates are above industry average</p>
                  <p>⚡ Peak usage hours: 9 AM - 11 AM, 7 PM - 9 PM</p>
                  <p>🌟 Most popular category: Programming & Development</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;