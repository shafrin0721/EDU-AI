import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AppIcon from "@/components/AppIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import Loading from "@/components/ui/Loading";
import { courseService } from "@/services/api/courseService";
import moduleService from "@/services/api/moduleService";
import { enrollmentService } from "@/services/api/enrollmentService";
import learningSessionService from "@/services/api/learningSessionService";
import Badge from "@/components/atoms/Badge";

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
      
      const courseData = await courseService.getById(parseInt(courseId));
      if (!courseData) {
        navigate('/not-found');
        return;
      }
      setCourse(courseData);

      const moduleData = await moduleService.getAll();
      const courseModules = moduleData.filter(m => String(m.courseId) === courseId);
      setModules(courseModules.sort((a, b) => a.sequence - b.sequence));

      if (user) {
        const enrollments = await enrollmentService.getAll();
        const courseIdNum = parseInt(courseId);
        const userEnrollment = enrollments.find(e => 
          String(e.studentId) === String(user.Id) && String(e.courseId) === String(courseIdNum)
        );
        setEnrollment(userEnrollment);

        if (userEnrollment) {
          const sessionsData = await learningSessionService.getAll();
          const userSessions = sessionsData.filter(s => 
            String(s.studentId) === String(user.Id) && String(s.courseId) === courseId
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
        String(session.moduleId) === String(module.Id) && session.completionStatus === 'completed'
      );
    });
    
    return Math.round((completedModules.length / modules.length) * 100);
  };

  if (loading) return <Loading />;
  if (!course) return null;

  const progress = calculateProgress();
  const isEnrolled = !!enrollment;
  const estimatedHours = Math.ceil(modules.length * 2.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button variant="ghost" onClick={() => navigate("/courses")} icon="ArrowLeft">
            Back to Courses
          </Button>
          {isEnrolled && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Progress: {progress}%</div>
              <ProgressBar value={progress} className="w-32" />
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-8 text-white">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            {course.Category}
                          </Badge>
                          <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm capitalize">
                            {course.DifficultyLevel}
                          </Badge>
                        </div>
                        <h1 className="text-4xl font-bold mb-4 leading-tight">{course.Title}</h1>
                        <p className="text-xl text-white/90 mb-6 leading-relaxed">{course.Description}</p>
                        <div className="flex items-center space-x-8 text-white/80">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <AppIcon name="Clock" size={18} />
                            </div>
                            <div>
                              <div className="text-white font-semibold">{estimatedHours}h</div>
                              <div className="text-xs text-white/70">Estimated time</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <AppIcon name="BookOpen" size={18} />
                            </div>
                            <div>
                              <div className="text-white font-semibold">{modules.length}</div>
                              <div className="text-xs text-white/70">Modules</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <AppIcon name="Users" size={18} />
                            </div>
                            <div>
                              <div className="text-white font-semibold">2.5k+</div>
                              <div className="text-xs text-white/70">Students</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-3 ml-8">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <AppIcon name="GraduationCap" size={32} />
                        </div>
                        {isEnrolled && (
                          <div className="text-center">
                            <div className="text-2xl font-bold">{progress}%</div>
                            <div className="text-xs text-white/70">Complete</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isEnrolled ? (
                      <Button
                        onClick={handleEnroll}
                        loading={enrolling}
                        size="lg"
                        className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 shadow-lg"
                        icon="Play"
                      >
                        Start Learning Journey
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => {
                            // Find first incomplete module
                            const nextModule = modules.find((module, index) => {
                              const isCompleted = sessions.some(
                                session => String(session.moduleId) === String(module.Id) && session.completionStatus === "completed"
                              );
                              return !isCompleted;
                            });
                            if (nextModule) {
                              navigate(`/module-detail/${nextModule.Id}`);
                            } else {
                              toast.error('All modules completed!');
                            }
                          }}
                          size="lg"
                          className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 shadow-lg"
                          icon="Play"
                        >
                          Continue Learning
                        </Button>
                        <div className="flex items-center space-x-3 text-white/90">
                          <span className="text-sm">Progress:</span>
                          <ProgressBar value={progress} className="w-32 bg-white/20" color="accent" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <AppIcon name="List" size={20} className="mr-2" />
                  Course Modules
                </h2>
                <div className="space-y-4">
                  {modules.map((module, index) => {
                    const isCompleted = sessions.some(
                      session => String(session.moduleId) === String(module.Id) && session.completionStatus === "completed"
                    );

                    const isAccessible = isEnrolled && (index === 0 || modules.slice(0, index).every(prevModule => 
                      sessions.some(session => String(session.moduleId) === String(prevModule.Id) && session.completionStatus === "completed")
                    ));

                    return (
                      <motion.div
                        key={module.Id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isCompleted 
                            ? "border-green-200 bg-green-50" 
                            : isAccessible 
                              ? "border-blue-200 bg-blue-50 hover:border-blue-300 cursor-pointer" 
                              : "border-gray-200 bg-gray-50"
                        }`}
                        onClick={() => {
                          if (isAccessible) {
                            navigate(`/module-detail/${module.Id}`);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? "bg-green-600 text-white" 
                                : isAccessible 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-gray-400 text-white"
                            }`}>
                              {isCompleted ? <AppIcon name="Check" size={16} /> : <span className="text-sm font-medium">{index + 1}</span>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{module.title}</h3>
                              <p className="text-sm text-gray-600">{module.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isCompleted && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>}
                            {isAccessible && !isCompleted && <AppIcon name="ChevronRight" size={16} className="text-gray-400" />}
                            {!isAccessible && !isCompleted && <AppIcon name="Lock" size={16} className="text-gray-400" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                  <AppIcon name="BarChart3" size={20} className="mr-2 text-primary-600" />
                  Course Overview
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <AppIcon name="BookOpen" size={16} className="text-primary-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Modules</span>
                    </div>
                    <span className="font-bold text-primary-600 text-lg">{modules.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                        <AppIcon name="Clock" size={16} className="text-accent-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Duration</span>
                    </div>
                    <span className="font-bold text-accent-600 text-lg">{estimatedHours}h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                        <AppIcon name="TrendingUp" size={16} className="text-secondary-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Level</span>
                    </div>
                    <span className="font-bold text-secondary-600 text-lg capitalize">{course.DifficultyLevel}</span>
                  </div>
                  {isEnrolled && (
                    <div className="border-t pt-4 mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <AppIcon name="Target" size={16} className="mr-2 text-green-600" />
                        Your Progress
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Overall Completion</span>
                          <span className="font-bold text-green-600 text-xl">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} color="success" className="h-3 bg-gray-200" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Modules Completed</span>
                          <span className="font-semibold text-gray-700">
                            {Math.floor(progress / 100 * modules.length)}/{modules.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 ai-card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <AppIcon name="Lightbulb" size={16} className="mr-2 text-purple-600" />
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
                        Based on your learning pattern, consider starting with {modules.length > 0 ? "15-20 minute sessions" : "foundational concepts"}
                        {isEnrolled ? " and gradually increase as you build momentum" : " after enrollment"}.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
