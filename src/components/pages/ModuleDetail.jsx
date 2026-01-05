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
        
// Mock module data with YouTube video integration
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
          content: {
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU',
            videoAttribution: {
              creator: 'Zach Galbraith',
              channel: 'ZachGalbraith',
              title: 'Machine Learning Explained',
              originalUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU'
            }
          },
          theoreticalContent: {
            learningTheories: [
              {
                name: 'Constructivism',
                description: 'Learning is an active process where learners construct their own understanding through experience and reflection.',
                application: 'In ML education, students build understanding by experimenting with algorithms and observing outcomes.',
                keyPrinciples: ['Active learning', 'Prior knowledge integration', 'Social interaction', 'Authentic contexts']
              },
              {
                name: 'Cognitive Load Theory',
                description: 'Learning is optimized when cognitive load is managed effectively, focusing on intrinsic, extraneous, and germane load.',
                application: 'ML concepts are presented progressively, starting with simple algorithms before moving to complex neural networks.',
                keyPrinciples: ['Progressive complexity', 'Worked examples', 'Problem-solving schemas', 'Chunking information']
              }
            ],
            foundations: [
              {
                category: 'Mathematical Foundations',
                concepts: [
                  {
                    name: 'Linear Algebra',
                    description: 'Vector spaces, matrices, and linear transformations form the mathematical backbone of machine learning.',
                    importance: 'Essential for understanding neural networks, PCA, and most optimization algorithms.'
                  },
                  {
                    name: 'Statistics & Probability',
                    description: 'Statistical inference and probability distributions are fundamental to understanding ML model behavior.',
                    importance: 'Critical for model evaluation, uncertainty quantification, and Bayesian methods.'
                  }
                ]
              }
            ]
          },
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