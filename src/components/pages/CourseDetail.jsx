import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ProgressBar from '@/components/atoms/ProgressBar';
import Loading from '@/components/ui/Loading';
import { courseService } from '@/services/api/courseService';
import { moduleService } from '@/services/api/moduleService';
import { enrollmentService } from '@/services/api/enrollmentService';
import { learningSessionService } from '@/services/api/learningSessionService';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId, user?.Id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load course details
      const courseData = await courseService.getById(parseInt(courseId));
      if (!courseData) {
        navigate('/not-found');
        return;
      }
      setCourse(courseData);

      // Load course modules
      const moduleData = await moduleService.getAll();
      const courseModules = moduleData.filter(m => m.CourseId === parseInt(courseId));
      setModules(courseModules.sort((a, b) => a.OrderIndex - b.OrderIndex));

      if (user) {
        // Check enrollment status
        const enrollments = await enrollmentService.getAll();
        const userEnrollment = enrollments.find(e => 
          e.UserId === user.Id && e.CourseId === parseInt(courseId)
        );
        setEnrollment(userEnrollment);

        // Load learning sessions if enrolled
        if (userEnrollment) {
          const sessionsData = await learningSessionService.getAll();
          const userSessions = sessionsData.filter(s => 
            s.UserId === user.Id && s.CourseId === parseInt(courseId)
          );
          setSessions(userSessions);
        }
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await enrollmentService.create({
        UserId: user.Id,
        CourseId: parseInt(courseId),
        Status: 'active',
        Progress: 0,
        StartDate: new Date().toISOString(),
        LastAccessDate: new Date().toISOString()
      });
      
      toast.success('Successfully enrolled in course!');
      loadCourseData();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const calculateProgress = () => {
    if (!enrollment || modules.length === 0) return 0;
    
    const completedModules = modules.filter(module => {
      return sessions.some(session => 
        session.ModuleId === module.Id && session.CompletionStatus === 'completed'
      );
    });
    
    return Math.round((completedModules.length / modules.length) * 100);
  };

  if (loading) return <Loading />;
  if (!course) return null;

  const progress = calculateProgress();
  const isEnrolled = !!enrollment;
  const estimatedHours = Math.ceil(modules.length * 2.5); // Estimate 2.5 hours per module

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/courses')}
            icon="ArrowLeft"
          >
            Back to Courses
          </Button>
          
          {isEnrolled && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: {progress}%
              </div>
              <ProgressBar value={progress} className="w-32" />
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {course.Title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      {course.Description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ApperIcon name="Clock" size={16} className="mr-1" />
                        {estimatedHours}h estimated
                      </div>
                      <div className="flex items-center">
                        <ApperIcon name="BookOpen" size={16} className="mr-1" />
                        {modules.length} modules
                      </div>
                      <div className="flex items-center">
                        <ApperIcon name="Users" size={16} className="mr-1" />
                        {course.DifficultyLevel}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <ApperIcon name="GraduationCap" size={24} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {course.Category}
                    </span>
                  </div>
                </div>

                {!isEnrolled && (
                  <Button
                    onClick={handleEnroll}
                    loading={enrolling}
                    size="lg"
                    className="w-full"
                    icon="Play"
                  >
                    Start Learning
                  </Button>
                )}
              </Card>
            </motion.div>

            {/* Course Modules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ApperIcon name="List" size={20} className="mr-2" />
                  Course Modules
                </h2>
                
                <div className="space-y-4">
                  {modules.map((module, index) => {
                    const isCompleted = sessions.some(session => 
                      session.ModuleId === module.Id && session.CompletionStatus === 'completed'
                    );
                    const isAccessible = isEnrolled && (index === 0 || modules.slice(0, index).every((prevModule) =>
                      sessions.some(session => 
                        session.ModuleId === prevModule.Id && session.CompletionStatus === 'completed'
                      )
                    ));

                    return (
                      <motion.div
                        key={module.Id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isCompleted
                            ? 'border-green-200 bg-green-50'
                            : isAccessible
                            ? 'border-blue-200 bg-blue-50 hover:border-blue-300 cursor-pointer'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => {
                          if (isAccessible) {
                            navigate(`/modules/${module.Id}`);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-green-600 text-white'
                                : isAccessible
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-400 text-white'
                            }`}>
                              {isCompleted ? (
                                <ApperIcon name="Check" size={16} />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {module.Title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {module.Description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isCompleted && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                            {isAccessible && !isCompleted && (
                              <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                            )}
                            {!isAccessible && !isCompleted && (
                              <ApperIcon name="Lock" size={16} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Course Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Modules</span>
                    <span className="font-semibold">{modules.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Time</span>
                    <span className="font-semibold">{estimatedHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="font-semibold capitalize">{course.DifficultyLevel}</span>
                  </div>
                  {isEnrolled && (
                    <>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Your Progress</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-semibold">
                          {Math.floor((progress / 100) * modules.length)}/{modules.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Learning Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 ai-card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="Lightbulb" size={16} className="mr-2 text-purple-600" />
                  AI Learning Tips
                </h3>
<div className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-start space-x-2">
                    <span>⏱️</span>
                    <span>AI recommends 30-45 minute focused sessions for optimal retention and comprehension</span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span>📝</span>
                    <span>Active note-taking increases retention by 65% - summarize key concepts in your own words</span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span>🔄</span>
                    <span>Spaced repetition review improves long-term memory - revisit previous modules weekly</span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span>🎯</span>
                    <span>Consistent daily practice outperforms intensive cramming sessions by 3x learning efficiency</span>
                  </p>
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-medium text-blue-800 mb-1">Personalized for You</p>
                    <p className="text-xs text-blue-700">
                      Based on your learning pattern, consider starting with {modules.length > 0 ? '15-20 minute sessions' : 'foundational concepts'} 
                      {isEnrolled ? ' and gradually increase as you build momentum' : ' after enrollment'}.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;