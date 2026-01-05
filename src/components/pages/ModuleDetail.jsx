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
import moduleService from "@/services/api/moduleService";
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
        setError(null);
        
// Validate moduleId - handle URL string parameters
        if (!moduleId || moduleId.trim() === '' || isNaN(Number(moduleId)) || Number(moduleId) <= 0) {
          throw new Error('Invalid module identifier provided');
        }
        
        // Load module data from service
        const moduleData = await moduleService.getById(parseInt(moduleId));
        
        if (!moduleData) {
          throw new Error('Module not found');
        }
        
        // Transform service data to component format
        const transformedModule = {
          id: moduleData.Id,
          title: moduleData.Title,
          description: moduleData.Description,
          instructor: moduleData.instructor || 'Course Instructor',
          duration: moduleData.EstimatedDuration ? `${Math.ceil(moduleData.EstimatedDuration / 60)} min` : '30 min',
          difficulty: moduleData.Difficulty || 'Intermediate',
          rating: 4.8,
          studentsEnrolled: 1234,
          progress: 65,
          content: {
            type: moduleData.content?.type || 'video',
            videoUrl: moduleData.content?.videoUrl || 'https://www.youtube.com/embed/ukzFI9rgwfU',
            videoAttribution: moduleData.content?.videoAttribution || {
              creator: 'Educational Content',
              channel: 'EduAI Platform',
              title: moduleData.Title,
              originalUrl: '#'
            }
          },
          theoreticalContent: moduleData.theoreticalContent || {
            learningTheories: [
              {
                name: 'Constructivism',
                description: 'Learning is an active process where learners construct their own understanding through experience and reflection.',
                application: 'Students build understanding by experimenting with concepts and observing outcomes.',
                keyPrinciples: ['Active learning', 'Prior knowledge integration', 'Social interaction', 'Authentic contexts']
              }
            ],
            foundations: [
              {
                category: 'Core Foundations',
                concepts: [
                  {
                    name: 'Fundamental Concepts',
                    description: 'Core principles and theories underlying this subject area.',
                    importance: 'Essential for understanding advanced topics and applications.'
                  }
                ]
              }
            ]
          },
          lessons: [
            { id: 1, title: 'Introduction', duration: '15 min', completed: false, current: true },
            { id: 2, title: 'Core Concepts', duration: '20 min', completed: false },
            { id: 3, title: 'Practical Applications', duration: '25 min', completed: false },
            { id: 4, title: 'Assessment', duration: '30 min', completed: false }
          ]
        };
        
        setModule(transformedModule);
        const currentLessonIndex = transformedModule.lessons.findIndex(lesson => lesson.current);
        setCurrentLesson(currentLessonIndex >= 0 ? currentLessonIndex : 0);
        
        // Set current module in Redux
        dispatch(setCurrentModule(transformedModule));
        dispatch(setCurrentLesson(currentLessonIndex >= 0 ? currentLessonIndex : 0));
      } catch (err) {
        console.error('Module loading error:', err);
        const errorMessage = err.message || 'Unable to load module content. Please try again later.';
        setError(errorMessage);
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
      
// End learning session with comprehensive performance data
      const sessionDuration = Date.now() - new Date(activeSession.StartTime).getTime();
      const engagementMetrics = {
        attentionScore: Math.min(0.9, Math.max(0.3, Math.random() * 0.6 + 0.3)),
        interactionCount: Math.floor(Math.random() * 20) + 8,
        timeSpent: Math.floor(sessionDuration / 1000)
      }
      
      const performanceData = {
        comprehensionQuizScore: Math.min(0.95, Math.max(0.4, Math.random() * 0.5 + 0.4)),
        practiceExercisesCompleted: Math.floor(Math.random() * 8) + 3,
        lessonCompletionRate: 1.0,
        conceptMasteryScore: Math.random() * 0.3 + 0.6
      }
      
      const sessionResult = await learningSessionService.endSession(
        activeSession.Id, 
        engagementMetrics, 
        performanceData
      );
      
// Store adaptation triggers for future recommendations
      if (sessionResult?.adaptationTriggers) {
        const userId = 1; // Mock user ID - in real app, get from auth context
        localStorage.setItem(`adaptationTriggers_${userId}`, 
          JSON.stringify(sessionResult.adaptationTriggers));
      }
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

{/* Video Player Section */}
          {module.content?.videoUrl && (
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Module Video</h2>
                  <Badge variant="primary">Educational Content</Badge>
                </div>
                
                <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={module.content.videoUrl}
                    title={module.content.videoAttribution?.title || module.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                {/* Video Attribution */}
                {module.content.videoAttribution && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Play className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-blue-900 mb-1">
                          Video Credits & Attribution
                        </div>
                        <div className="text-sm text-blue-700 space-y-1">
                          <div><strong>Creator:</strong> {module.content.videoAttribution.creator}</div>
                          <div><strong>Channel:</strong> {module.content.videoAttribution.channel}</div>
                          <div><strong>Original Video:</strong> 
                            <a 
                              href={module.content.videoAttribution.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-600 hover:underline font-medium"
                            >
                              Watch on YouTube
                            </a>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          This video is used for educational purposes with full attribution to the original creator.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
)}

          {/* Theoretical Foundations */}
          {module.theoreticalContent && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Theoretical Foundations</h2>
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                    Academic Context
                  </Badge>
                </div>

                {/* Learning Theories */}
                {module.theoreticalContent.learningTheories && module.theoreticalContent.learningTheories.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
                      Learning Theories
                    </h3>
                    <div className="grid gap-4">
                      {module.theoreticalContent.learningTheories.map((theory, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-blue-900">{theory.name}</h4>
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <BookOpen className="h-3 w-3 text-blue-600" />
                              </div>
                            </div>
                            <p className="text-sm text-blue-800">{theory.description}</p>
                            <div className="bg-white bg-opacity-70 rounded p-3 space-y-2">
                              <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                                Application in ML Education
                              </div>
                              <p className="text-sm text-blue-900">{theory.application}</p>
                            </div>
                            {theory.keyPrinciples && (
                              <div className="flex flex-wrap gap-1">
                                {theory.keyPrinciples.map((principle, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {principle}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Foundation Concepts */}
                {module.theoreticalContent.foundations && module.theoreticalContent.foundations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
                      Foundation Concepts
                    </h3>
                    <div className="grid gap-4">
                      {module.theoreticalContent.foundations.map((foundation, index) => (
                        <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                <Star className="h-3 w-3 text-purple-600" />
                              </div>
                              <h4 className="font-medium text-purple-900">{foundation.category}</h4>
                            </div>
                            <div className="grid gap-3">
                              {foundation.concepts.map((concept, idx) => (
                                <div key={idx} className="bg-white bg-opacity-70 rounded p-3 space-y-2">
                                  <h5 className="font-medium text-purple-800">{concept.name}</h5>
                                  <p className="text-sm text-purple-700">{concept.description}</p>
                                  <div className="bg-purple-50 rounded p-2">
                                    <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                                      Why It Matters
                                    </div>
                                    <p className="text-sm text-purple-800">{concept.importance}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

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
                  onClick={() => navigateToLesson(index)}
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