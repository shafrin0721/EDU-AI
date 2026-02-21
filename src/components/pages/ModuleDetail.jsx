import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Star, Users, FileText, Award, Brain } from "lucide-react";
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
  const { user } = useSelector(state => state.auth);
  
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [learningStarted, setLearningStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!moduleId || moduleId.trim() === '' || isNaN(Number(moduleId)) || Number(moduleId) <= 0) {
          throw new Error('Invalid module identifier provided');
        }
        
        const moduleData = await moduleService.getById(parseInt(moduleId));
        
        if (!moduleData) {
          throw new Error('Module not found');
        }
        
        // Transform service data to component format - handle new lesson format
        const contentType = moduleData.contentType || moduleData.content?.type || 'lesson';
        
        // Build sections from new content format - check both root level and content object
        const sections = [];
        
        // Add lesson sections if available (check both root level and content object)
        const lessonSections = moduleData.sections || moduleData.content?.sections || [];
        lessonSections.forEach((section, idx) => {
          sections.push({
            id: `section-${idx}`,
            type: 'lesson',
            title: section.title,
            content: section.content,
            examples: section.examples
          });
        });
        
        // Add detailed lessons if available
        const detailedLessons = moduleData.detailedLessons || moduleData.content?.detailedLessons || [];
        detailedLessons.forEach((lesson, idx) => {
          sections.push({
            id: `lesson-${idx}`,
            type: 'detailed',
            title: lesson.title,
            content: lesson.content,
            examples: lesson.examples
          });
        });
        
        // Add quiz section if available (check both root level and content object)
        const quizData = moduleData.quiz || moduleData.content?.quiz;
        if (quizData?.questions) {
          sections.push({
            id: 'quiz',
            type: 'quiz',
            title: 'Knowledge Check',
            questions: quizData.questions,
            passingScore: quizData.passingScore || 75
          });
        }
        
        const transformedModule = {
          id: moduleData.Id,
          title: moduleData.Title,
          description: moduleData.Description,
          instructor: moduleData.instructor || 'Course Instructor',
          duration: moduleData.EstimatedDuration ? `${Math.ceil(moduleData.EstimatedDuration / 60)} min` : '30 min',
          difficulty: moduleData.Difficulty || 'Intermediate',
          rating: 4.8,
          studentsEnrolled: 1234,
          progress: 0,
          contentType: contentType,
          sections: sections,
          learningObjectives: moduleData.learningObjectives || []
        };
        
        setModule(transformedModule);
        dispatch(setCurrentModule(transformedModule));
        
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
      const userId = user?.Id || 1;
      const session = await learningSessionService.create({
        studentId: userId,
        moduleId: parseInt(moduleId),
        lessonId: currentSection + 1,
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

  const completeSection = async () => {
    const userId = user?.Id || 1;
    
    try {
      // Update progress
      const completedSections = currentSection + 1;
      const progressPercent = Math.round((completedSections / module.sections.length) * 100);
      
      // End learning session if active
      if (activeSession) {
        const sessionDuration = Date.now() - new Date(activeSession.StartTime).getTime();
        const engagementMetrics = {
          attentionScore: Math.min(0.9, Math.max(0.3, Math.random() * 0.6 + 0.3)),
          interactionCount: Math.floor(Math.random() * 20) + 8,
          timeSpent: Math.floor(sessionDuration / 1000)
        };
        
        const performanceData = {
          comprehensionQuizScore: quizScore / 100,
          practiceExercisesCompleted: completedSections,
          lessonCompletionRate: progressPercent / 100,
          conceptMasteryScore: Math.random() * 0.3 + 0.6
        };
        
        await learningSessionService.endSession(activeSession.Id, engagementMetrics, performanceData);
      }
      
      // Update enrollment progress
      const courseId = moduleId; // In real app, get from course
      await enrollmentService.updateProgress(userId, courseId, progressPercent);
      
      // Move to next section or complete
      if (currentSection < module.sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setLearningStarted(false);
        setActiveSession(null);
        setQuizAnswers({});
        setQuizSubmitted(false);
        toast.success('Section completed! Moving to next.');
      } else {
        // Module completed - navigate to next module or back to courses
        setLearningStarted(false);
        
        // Try to find and navigate to the next module
        try {
          const allModules = await moduleService.getAll();
          const courseModules = allModules.filter(m => m.courseId === parseInt(courseId));
          const currentModuleIndex = courseModules.findIndex(m => m.Id === parseInt(moduleId));
          
          if (currentModuleIndex >= 0 && currentModuleIndex < courseModules.length - 1) {
            // There's a next module - navigate to it
            const nextModule = courseModules[currentModuleIndex + 1];
            toast.success('Module completed! 🎉 Moving to next module...');
            navigate(`/module-detail/${nextModule.Id}`);
          } else {
            // No more modules - course completed
            toast.success('Course completed! 🎉 Congratulations!');
            navigate('/courses');
          }
        } catch (navError) {
          toast.success('Module completed! 🎉');
          navigate('/courses');
        }
      }
      
    } catch (error) {
      console.error('Error completing section:', error);
      toast.error('Failed to complete section');
    }
  };

  const handleQuizAnswer = (questionId, answerIndex) => {
    if (!quizSubmitted) {
      setQuizAnswers({...quizAnswers, [questionId]: answerIndex});
    }
  };

  const submitQuiz = () => {
    const currentQuiz = module.sections[currentSection];
    if (!currentQuiz || currentQuiz.type !== 'quiz') return;
    
    let correct = 0;
    currentQuiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    
    const score = Math.round((correct / currentQuiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    
    if (score >= currentQuiz.passingScore) {
      toast.success(`Congratulations! You passed with ${score}%!`);
    } else {
      toast.info(`You scored ${score}%. Review the material and try again!`);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} />;
  if (!module) return <ErrorView message="Module not found" />;

  const currentContent = module.sections[currentSection];
  const progressPercentage = Math.round(((currentSection + 1) / module.sections.length) * 100);

  // Render lesson content
  const renderLessonContent = (content) => {
    // Handle markdown-like formatting
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-bold text-gray-900 mb-4">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-medium text-gray-800 mb-2 mt-4">{line.substring(4)}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-bold text-gray-900 my-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-4 text-gray-700 my-1">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={idx} />;
      }
      // Handle inline code
      if (line.includes('`')) {
        const parts = line.split('`');
        return (
          <p key={idx} className="text-gray-700 my-2">
            {parts.map((part, i) => 
              i % 2 === 1 
                ? <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-purple-600 font-mono">{part}</code>
                : part
            )}
          </p>
        );
      }
      return <p key={idx} className="text-gray-700 my-2">{line}</p>;
    });
  };

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
                  <FileText className="h-4 w-4" />
                  {module.sections.length} sections
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {module.studentsEnrolled.toLocaleString()} students
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{currentSection + 1}/{module.sections.length} sections</span>
                </div>
                <ProgressBar progress={progressPercentage} className="h-2" />
              </div>
              
              {/* Learning Objectives */}
              {module.learningObjectives && module.learningObjectives.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Learning Objectives
                  </h3>
                  <ul className="space-y-1">
                    {module.learningObjectives.map((obj, idx) => (
                      <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Current Section Content */}
          {currentContent && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentContent.type === 'quiz' ? (
                      <Award className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="text-sm font-medium text-gray-500">
                      Section {currentSection + 1} of {module.sections.length}
                    </span>
                  </div>
                  <Badge variant={currentContent.type === 'quiz' ? 'warning' : 'primary'}>
                    {currentContent.type === 'quiz' ? 'Quiz' : 'Lesson'}
                  </Badge>
                </div>

                <h2 className="text-xl font-semibold text-gray-900">{currentContent.title}</h2>

                {/* Lesson Content */}
                {currentContent.type !== 'quiz' && currentContent.content && (
                  <div className="prose max-w-none">
                    {renderLessonContent(currentContent.content)}
                    
                    {/* Examples */}
                    {currentContent.examples && currentContent.examples.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-green-900 mb-2">Real-World Examples</h4>
                        <ul className="space-y-1">
                          {currentContent.examples.map((ex, idx) => (
                            <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                              <Star className="h-3 w-3 text-green-600 mt-1 shrink-0" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Content */}
                {currentContent.type === 'quiz' && currentContent.questions && (
                  <div className="space-y-6">
                    {currentContent.questions.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-3">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((option, oIdx) => {
                            const isSelected = quizAnswers[q.id || qIdx] === oIdx;
                            const isCorrect = q.correct === oIdx;
                            let optionClass = "p-3 rounded-lg border-2 cursor-pointer transition-colors ";
                            
                            if (quizSubmitted) {
                              if (isCorrect) {
                                optionClass += "border-green-500 bg-green-100";
                              } else if (isSelected && !isCorrect) {
                                optionClass += "border-red-500 bg-red-100";
                              } else {
                                optionClass += "border-gray-200 bg-white";
                              }
                            } else {
                              optionClass += isSelected 
                                ? "border-blue-500 bg-blue-50" 
                                : "border-gray-200 hover:border-gray-300 bg-white";
                            }
                            
                            return (
                              <div
                                key={oIdx}
                                onClick={() => handleQuizAnswer(q.id || qIdx, oIdx)}
                                className={optionClass}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                  </div>
                                  <span className="text-gray-700">{option}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Show explanation after submission */}
                        {quizSubmitted && (
                          <div className={`mt-3 p-3 rounded-lg ${q.correct === quizAnswers[q.id || qIdx] ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <p className="text-sm font-medium">
                              {q.correct === quizAnswers[q.id || qIdx] ? '✅ Correct!' : '❌ Incorrect'}
                            </p>
                            {q.explanation && (
                              <p className="text-sm text-gray-700 mt-1">{q.explanation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Quiz Result */}
                    {quizSubmitted && (
                      <div className={`p-4 rounded-lg text-center ${
                        quizScore >= currentContent.passingScore 
                          ? 'bg-green-100 border-2 border-green-500' 
                          : 'bg-red-100 border-2 border-red-500'
                      }`}>
                        <p className="text-lg font-bold">
                          {quizScore >= currentContent.passingScore 
                            ? `🎉 Congratulations! You passed with ${quizScore}%!` 
                            : `You scored ${quizScore}%. You need ${currentContent.passingScore}% to pass.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  {currentContent.type === 'quiz' ? (
                    <>
                      {!quizSubmitted ? (
                        <Button 
                          className="flex items-center gap-2"
                          onClick={submitQuiz}
                          disabled={Object.keys(quizAnswers).length < currentContent.questions.length}
                        >
                          <Award className="h-4 w-4" />
                          Submit Quiz
                        </Button>
                      ) : quizScore >= currentContent.passingScore ? (
                        <Button 
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          onClick={completeSection}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Continue
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                            setQuizScore(0);
                          }}
                        >
                          <Play className="h-4 w-4" />
                          Try Again
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {!learningStarted ? (
                        <Button 
                          className="flex items-center gap-2"
                          onClick={startLearningSession}
                        >
                          <Play className="h-4 w-4" />
                          Start Reading
                        </Button>
                      ) : (
                        <Button 
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          onClick={completeSection}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete & Continue
                        </Button>
                      )}
                    </>
                  )}
                  
                  {currentSection > 0 && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setCurrentSection(currentSection - 1);
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                        setQuizScore(0);
                      }}
                    >
                      Previous
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Section Navigation */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Course Sections</h3>
            <div className="space-y-2">
              {module.sections.map((section, index) => (
                <div
                  key={section.id}
                  onClick={() => {
                    setCurrentSection(index);
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    setQuizScore(0);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentSection 
                      ? 'bg-primary-50 border border-primary-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="shrink-0">
                    {section.type === 'quiz' ? (
                      <Award className={`h-5 w-5 ${index === currentSection ? 'text-yellow-600' : 'text-gray-400'}`} />
                    ) : (
                      <FileText className={`h-5 w-5 ${index === currentSection ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate text-sm ${
                      index === currentSection ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {section.title}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {section.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Progress Summary */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progressPercentage) / 100}
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{progressPercentage}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {currentSection + 1} of {module.sections.length} sections completed
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
