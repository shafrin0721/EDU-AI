import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, MoreVertical, TrendingUp, Award, Clock } from 'lucide-react';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import ProgressBar from '@/components/atoms/ProgressBar';
import Loading from '@/components/ui/Loading';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock students data
        const mockStudents = [
          {
            id: 1,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            enrolledCourses: 3,
            completedCourses: 1,
            totalProgress: 75,
            lastActive: '2024-01-15',
            status: 'active',
            achievements: 5
          },
          {
            id: 2,
            name: 'Bob Smith',
            email: 'bob@example.com',
            enrolledCourses: 2,
            completedCourses: 2,
            totalProgress: 100,
            lastActive: '2024-01-14',
            status: 'active',
            achievements: 8
          },
          {
            id: 3,
            name: 'Carol Davis',
            email: 'carol@example.com',
            enrolledCourses: 4,
            completedCourses: 0,
            totalProgress: 45,
            lastActive: '2024-01-10',
            status: 'inactive',
            achievements: 2
          }
        ];
        
        setStudents(mockStudents);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Monitor student progress and engagement</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{students.length}</div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active Students</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {students.reduce((sum, s) => sum + s.completedCourses, 0)}
              </div>
              <div className="text-sm text-gray-500">Completed Courses</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(students.reduce((sum, s) => sum + s.totalProgress, 0) / students.length)}%
              </div>
              <div className="text-sm text-gray-500">Avg Progress</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              icon={Search}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Students List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.enrolledCourses} enrolled
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.completedCourses} completed
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">{student.totalProgress}%</div>
                      <ProgressBar progress={student.totalProgress} className="h-1 w-20" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-900">{student.achievements}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(student.status)} size="sm">
                      {student.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">Try adjusting your search or add new students</p>
        </div>
      )}
    </div>
  );
};

export default Students;