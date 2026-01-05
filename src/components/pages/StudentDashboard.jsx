import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ProgressBar from '@/components/atoms/ProgressBar';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import ProgressRing from '@/components/molecules/ProgressRing';
import StatCard from '@/components/molecules/StatCard';
import courseService from '@/services/api/courseService';
import { enrollmentService } from '@/services/api/enrollmentService';
import learningSessionService from '@/services/api/learningSessionService';
import { achievementService } from '@/services/api/achievementService';
import assessmentService from '@/services/api/assessmentService';

const StudentDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalXP: 0,
    streak: 0,
    completedCourses: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user enrollments
      const enrollmentData = await enrollmentService.getAll();
      const userEnrollments = enrollmentData.filter(e => e.UserId === user.Id);
      setEnrollments(userEnrollments);

      // Load enrolled courses
      const courseData = await courseService.getAll();
      const enrolledCourses = courseData.filter(course => 
        userEnrollments.some(enrollment => enrollment.CourseId === course.Id)
      );
      setCourses(enrolledCourses);

      // Load learning sessions
      const sessionData = await learningSessionService.getAll();
      const userSessions = sessionData.filter(s => s.UserId === user.Id);
      setSessions(userSessions);

      // Load achievements
      const achievementData = await achievementService.getAll();
      const userAchievements = achievementData.filter(a => a.UserId === user.Id);
      setAchievements(userAchievements);

      // Load assessments
      const assessmentData = await assessmentService.getAll();
      const userAssessments = assessmentData.filter(a => a.UserId === user.Id);
      setAssessments(userAssessments);

      // Calculate stats
      calculateStats(userEnrollments, userSessions, userAchievements, userAssessments);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (enrollments, sessions, achievements, assessments) => {
    const totalXP = achievements.reduce((sum, achievement) => sum + (achievement.XPReward || 0), 0);
    
    // Calculate learning streak (simplified)
    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.StartTime);
      const daysDiff = Math.floor((new Date() - sessionDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    const streak = Math.min(recentSessions.length, 7);
    
    const completedCourses = enrollments.filter(e => e.Progress === 100).length;
    
    const completedAssessments = assessments.filter(a => a.Status === 'completed');
    const averageScore = completedAssessments.length > 0 
      ? Math.round(completedAssessments.reduce((sum, a) => sum + a.Score, 0) / completedAssessments.length)
      : 0;

    setStats({ totalXP, streak, completedCourses, averageScore });
  };

  const getStreakColor = (streak) => {
    if (streak >= 7) return 'text-orange-500';
    if (streak >= 3) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getNextBadge = () => {
    if (stats.totalXP < 100) return { name: 'First Steps', needed: 100 - stats.totalXP };
    if (stats.totalXP < 500) return { name: 'Rising Star', needed: 500 - stats.totalXP };
    if (stats.totalXP < 1000) return { name: 'Knowledge Seeker', needed: 1000 - stats.totalXP };
    return { name: 'Master Learner', needed: 0 };
  };

  if (loading) return <Loading />;

  const nextBadge = getNextBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.FirstName}! 🎓
          </h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total XP"
            value={stats.totalXP.toLocaleString()}
            icon="Zap"
            trend={stats.totalXP > 0 ? 'up' : 'neutral'}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
          />
          
          <StatCard
            title="Learning Streak"
            value={`${stats.streak} days`}
            icon="Flame"
            trend={stats.streak >= 3 ? 'up' : 'neutral'}
            className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
          />
          
          <StatCard
            title="Completed Courses"
            value={stats.completedCourses}
            icon="GraduationCap"
            trend={stats.completedCourses > 0 ? 'up' : 'neutral'}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
          />
          
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon="Target"
            trend={stats.averageScore >= 80 ? 'up' : stats.averageScore >= 60 ? 'neutral' : 'down'}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ApperIcon name="BookOpen" size={20} className="mr-2" />
                    My Courses ({enrollments.length})
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/courses')}
                    icon="Plus"
                  >
                    Browse Courses
                  </Button>
                </div>

                {enrollments.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <ApperIcon name="BookOpen" size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                    <p className="text-gray-600">Start your learning journey by enrolling in a course!</p>
                    <Button onClick={() => navigate('/courses')} icon="ArrowRight">
                      Explore Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments.slice(0, 4).map((enrollment, index) => {
                      const course = courses.find(c => c.Id === enrollment.CourseId);
                      if (!course) return null;

                      return (
                        <motion.div
                          key={enrollment.Id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors cursor-pointer"
                          onClick={() => navigate(`/courses/${course.Id}`)}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <ApperIcon name="GraduationCap" size={20} className="text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {course.Title}
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {course.Description}
                              </p>
                              <div className="flex items-center mt-2 space-x-4">
                                <ProgressBar 
                                  value={enrollment.Progress} 
                                  className="flex-1 max-w-32"
                                />
                                <span className="text-sm text-gray-500">
                                  {enrollment.Progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {enrollment.Progress === 100 && (
                              <Badge variant="success">Completed</Badge>
                            )}
                            <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {enrollments.length > 4 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => navigate('/courses')}
                      >
                        View All Courses ({enrollments.length})
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ApperIcon name="Activity" size={20} className="mr-2" />
                  Recent Activity
                </h2>

                {sessions.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <ApperIcon name="Clock" size={16} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session, index) => {
                      const course = courses.find(c => c.Id === session.CourseId);
                      
                      return (
                        <motion.div
                          key={session.Id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                        >
                          <div className={`w-3 h-3 rounded-full ${
                            session.CompletionStatus === 'completed' 
                              ? 'bg-green-500' 
                              : 'bg-yellow-500'
                          }`} />
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {session.CompletionStatus === 'completed' ? 'Completed' : 'Started'} module in {course?.Title || 'Unknown Course'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.StartTime).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {session.CompletionStatus === 'completed' && (
                            <div className="text-xs text-green-600 font-medium">
                              +{session.XPEarned || 10} XP
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Gamification Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
                  <ApperIcon name="Trophy" size={16} className="mr-2" />
                  Your Progress
                </h3>

                <div className="space-y-6">
                  {/* XP Progress */}
                  <div className="text-center space-y-2">
                    <ProgressRing
                      value={Math.min((stats.totalXP % 1000) / 10, 100)}
                      size={120}
                      strokeWidth={8}
                      className="mx-auto"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {stats.totalXP}
                        </div>
                        <div className="text-xs text-gray-600">XP</div>
                      </div>
                    </ProgressRing>
                    
                    {nextBadge.needed > 0 && (
                      <p className="text-sm text-gray-600">
                        {nextBadge.needed} XP until <span className="font-medium">{nextBadge.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Streak */}
                  <div className="text-center space-y-2">
                    <div className={`text-4xl ${getStreakColor(stats.streak)} streak-flame`}>
                      🔥
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {stats.streak} Day Streak
                      </div>
                      <p className="text-xs text-gray-600">
                        {stats.streak >= 7 
                          ? 'Amazing! Keep it up!' 
                          : stats.streak >= 3 
                          ? 'Great progress!' 
                          : 'Start building your streak!'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <ApperIcon name="Award" size={16} className="mr-2" />
                    Badges ({achievements.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/achievements')}
                  >
                    View All
                  </Button>
                </h3>

                {achievements.length === 0 ? (
                  <div className="text-center py-4 space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <ApperIcon name="Award" size={16} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">No badges yet</p>
                    <p className="text-xs text-gray-500">Complete activities to earn your first badge!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {achievements.slice(0, 6).map((achievement, index) => (
                      <motion.div
                        key={achievement.Id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * index }}
                        className="text-center p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200"
                        title={achievement.Description}
                      >
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {achievement.Type}
                        </div>
                        <div className="text-xs text-gray-600">
                          +{achievement.XPReward || 0} XP
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 ai-card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="Brain" size={16} className="mr-2 text-purple-600" />
                  AI Recommendations
                </h3>
                <div className="space-y-3 text-sm">
                  {stats.streak === 0 ? (
                    <div className="flex items-start space-x-2">
                      <span className="text-purple-600">💡</span>
                      <p className="text-gray-700">
                        Start a learning streak! Study for just 15 minutes today to begin building momentum.
                      </p>
                    </div>
                  ) : stats.averageScore < 70 ? (
                    <div className="flex items-start space-x-2">
                      <span className="text-purple-600">📚</span>
                      <p className="text-gray-700">
                        Consider reviewing previous modules to strengthen your foundation before moving forward.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2">
                      <span className="text-purple-600">🚀</span>
                      <p className="text-gray-700">
                        Great progress! Try exploring advanced topics or challenge yourself with practice problems.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;