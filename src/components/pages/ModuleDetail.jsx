import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Star, Users } from "lucide-react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentLesson, setCurrentModule } from "@/store/slices/dashboardSlice";
import learningSessionService from "@/services/api/learningSessionService";
import enrollmentService from "@/services/api/enrollmentService";

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [learningStarted, setLearningStarted] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock module data
        const mockModule = {
          id: moduleId,
          title: 'Introduction to Machine Learning',
          description: 'Learn the fundamentals of machine learning including algorithms, data preprocessing, and model evaluation.',
          instructor: 'Dr. Sarah Johnson',
          duration: '6 weeks',
          difficulty: 'Intermediate',
          rating: 4.8,
          studentsEnrolled: 1234,
          progress: 65,
          lessons: [
            { id: 1, title: 'What is Machine Learning?', duration: '15 min', completed: true },
            { id: 2, title: 'Types of Machine Learning', duration: '20 min', completed: true },
            { id: 3, title: 'Data Preprocessing', duration: '25 min', completed: true },
            { id: 4, title: 'Supervised Learning', duration: '30 min', completed: false, current: true },
            { id: 5, title: 'Unsupervised Learning', duration: '25 min', completed: false },
            { id: 6, title: 'Model Evaluation', duration: '20 min', completed: false },
            { id: 7, title: 'Final Project', duration: '45 min', completed: false }
          ]
        };
        
        setModule(mockModule);
        const currentLessonIndex = mockModule.lessons.findIndex(lesson => lesson.current);
        setCurrentLesson(currentLessonIndex);
        
        // Set current module in Redux
        dispatch(setCurrentModule(mockModule));
        dispatch(setCurrentLesson(currentLessonIndex));
      } catch (err) {
        setError('Failed to load module details');
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, dispatch]);

  const startLearningSession = async () => {
    try {
      const session = await learningSessionService.create({
        studentId: 1, // Mock student ID
        moduleId: parseInt(moduleId),
        lessonId: module.lessons[currentLesson].id,
        engagementMetrics: {},
        performanceData: {}
      });
      
      setActiveSession(session);
      setLearningStarted(true);
      toast.success('Learning session started!');
    } catch (error) {
      toast.error('Failed to start learning session');
    }
  };

  const completeLesson = async () => {
    if (!activeSession) return;
    
    try {
      // Mark current lesson as completed
      const updatedLessons = [...module.lessons];
      updatedLessons[currentLesson].completed = true;
      
      // Calculate progress percentage
      const completedLessons = updatedLessons.filter(lesson => lesson.completed).length;
      const progressPercent = Math.round((completedLessons / updatedLessons.length) * 100);
      
      // Update module state
      const updatedModule = { ...module, lessons: updatedLessons, progress: progressPercent };
      setModule(updatedModule);
      
      // End learning session with performance data
      await learningSessionService.endSession(activeSession.Id, {
        attentionScore: 0.85,
        interactionCount: 12,
        timeSpent: 1800
      }, {
        comprehensionQuizScore: 0.88,
        practiceExercisesCompleted: 5
      });
      
      // Update enrollment progress
      await enrollmentService.updateProgress(1, moduleId, progressPercent);
      
      setActiveSession(null);
      toast.success('Lesson completed successfully!');
      
      // Auto-advance to next lesson if available
      if (currentLesson < module.lessons.length - 1) {
        const nextLessonIndex = currentLesson + 1;
        updatedLessons[nextLessonIndex].current = true;
        updatedLessons[currentLesson].current = false;
        setCurrentLesson(nextLessonIndex);
        dispatch(setCurrentLesson(nextLessonIndex));
        setLearningStarted(false);
      } else {
        toast.success('Module completed! 🎉');
        setLearningStarted(false);
      }
      
    } catch (error) {
      toast.error('Failed to complete lesson');
    }
  };

  const navigateToLesson = (lessonIndex) => {
    if (lessonIndex >= 0 && lessonIndex < module.lessons.length) {
      // Update current lesson markers
      const updatedLessons = [...module.lessons];
      updatedLessons.forEach(lesson => lesson.current = false);
      updatedLessons[lessonIndex].current = true;
      
      setModule({ ...module, lessons: updatedLessons });
      setCurrentLesson(lessonIndex);
      dispatch(setCurrentLesson(lessonIndex));
      setLearningStarted(false);
      setActiveSession(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} />;
  if (!module) return <ErrorView message="Module not found" />;

  const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / module.lessons.length) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Info */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
                  <p className="text-gray-600">{module.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {module.difficulty}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {module.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {module.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {module.studentsEnrolled.toLocaleString()} students
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{completedLessons}/{module.lessons.length} lessons completed</span>
                </div>
                <ProgressBar progress={progressPercentage} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Current Lesson */}
          {currentLesson >= 0 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Current Lesson</h2>
                  <Badge variant="primary">In Progress</Badge>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {module.lessons[currentLesson]?.title}
</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {module.lessons[currentLesson]?.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      {!learningStarted ? (
                        <Button 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={startLearningSession}
                        >
                          <Play className="h-4 w-4" />
                          Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          onClick={completeLesson}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete Lesson
                        </Button>
                      )}
                      
                      {currentLesson > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
onClick={() => navigateToLesson(currentLesson - 1)}
                        >
                          Previous
                        </Button>
                      )}
                      
                      {currentLesson < module.lessons.length - 1 && (
                        <Button 
                          size="sm" 
variant="outline"
                          onClick={() => navigateToLesson(currentLesson + 1)}
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {module.instructor.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{module.instructor}</div>
                  <div className="text-sm text-gray-500">ML Researcher</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Lessons */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Lessons</h3>
            <div className="space-y-2">
              {module.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    lesson.current 
                      ? 'bg-primary-50 border border-primary-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentLesson(index)}
                >
                  <div className="shrink-0">
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : lesson.current ? (
                      <Play className="h-5 w-5 text-primary-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${
                      lesson.current ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {lesson.title}
                    </div>
                    <div className="text-sm text-gray-500">{lesson.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;