import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AppIcon from '@/components/AppIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import { courseService } from '@/services/api/courseService';
import { enrollmentService } from '@/services/api/enrollmentService';
import { userService } from '@/services/api/userService';

const Classes = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    if (user) {
      loadClassData();
    }
  }, [user]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load courses taught by this teacher
      const courseData = await courseService.getAll();
      const teacherCourses = courseData.filter(course => course.InstructorId === user.Id);
      setClasses(teacherCourses);

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
      }
    } catch (error) {
      console.error('Error loading class data:', error);
      setError('Failed to load your classes. Please try again.');
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const getClassStats = (classItem) => {
    const classEnrollments = enrollments.filter(e => e.CourseId === classItem.Id);
    const activeStudents = classEnrollments.filter(e => e.Status === 'active').length;
    const completedStudents = classEnrollments.filter(e => e.Status === 'completed').length;
    const averageProgress = classEnrollments.length > 0 
      ? Math.round(classEnrollments.reduce((sum, e) => sum + (e.Progress || 0), 0) / classEnrollments.length)
      : 0;

    return {
      totalStudents: classEnrollments.length,
      activeStudents,
      completedStudents,
      averageProgress
    };
  };

  const handleViewStudents = (classItem) => {
    setSelectedClass(classItem);
  };

  const getClassStudents = (classItem) => {
    const classEnrollments = enrollments.filter(e => e.CourseId === classItem.Id);
    return students.filter(student => 
      classEnrollments.some(e => e.UserId === student.Id)
    ).map(student => {
      const enrollment = classEnrollments.find(e => e.UserId === student.Id);
      return { ...student, enrollment };
    });
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadClassData} />;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">Manage your courses and track student progress</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/courses/create')}
            icon="Plus"
          >
            Create New Course
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/courses')}
            icon="BookOpen"
          >
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name="BookOpen" size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
          <p className="text-gray-600 mb-6">Start teaching by creating your first course</p>
          <Button onClick={() => navigate('/courses/create')} icon="Plus">
            Create Your First Course
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((classItem, index) => {
            const stats = getClassStats(classItem);
            
            return (
              <motion.div
                key={classItem.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Course Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {classItem.Title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {classItem.Description}
                        </p>
                      </div>
                      <Badge 
                        variant={classItem.Status === 'published' ? 'success' : 'warning'}
                        className="ml-2"
                      >
                        {classItem.Status}
                      </Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.totalStudents}
                        </div>
                        <div className="text-xs text-gray-500">Total Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.averageProgress}%
                        </div>
                        <div className="text-xs text-gray-500">Avg Progress</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudents(classItem)}
                        icon="Users"
                      >
                        Students
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/courses/${classItem.Id}`)}
                        icon="Eye"
                      >
                        View Course
                      </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{stats.activeStudents} active</span>
                        <span>{stats.completedStudents} completed</span>
                      </div>
                      <button
                        onClick={() => navigate(`/courses/${classItem.Id}/edit`)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <AppIcon name="Settings" size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Student Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedClass.Title} - Students
                  </h2>
                  <p className="text-sm text-gray-600">
                    {getClassStudents(selectedClass).length} enrolled students
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AppIcon name="X" size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {getClassStudents(selectedClass).map((student) => (
                  <div
                    key={student.Id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {student.profile?.firstName?.[0]}{student.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.profile?.firstName} {student.profile?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {student.enrollment?.Progress || 0}% Complete
                      </div>
                      <Badge 
                        variant={student.enrollment?.Status === 'completed' ? 'success' : 'primary'}
                        size="sm"
                      >
                        {student.enrollment?.Status || 'enrolled'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {getClassStudents(selectedClass).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AppIcon name="Users" size={24} className="mx-auto mb-2" />
                    <p>No students enrolled yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;