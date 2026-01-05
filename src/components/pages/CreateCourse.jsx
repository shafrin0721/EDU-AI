import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import { courseService } from '@/services/api/courseService';

const CreateCourse = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    Category: '',
    DifficultyLevel: 'beginner',
    Status: 'draft',
    Prerequisites: '',
    LearningObjectives: [''],
    Tags: []
  });

  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...formData.LearningObjectives];
    newObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      LearningObjectives: newObjectives
    }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      LearningObjectives: [...prev.LearningObjectives, '']
    }));
  };

  const removeObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      LearningObjectives: prev.LearningObjectives.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.Tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        Tags: [...prev.Tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      Tags: prev.Tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    if (!formData.Title.trim()) {
      toast.error('Course title is required');
      return false;
    }
    if (!formData.Description.trim()) {
      toast.error('Course description is required');
      return false;
    }
    if (!formData.Category.trim()) {
      toast.error('Course category is required');
      return false;
    }
    if (formData.LearningObjectives.filter(obj => obj.trim()).length === 0) {
      toast.error('At least one learning objective is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const courseData = {
        ...formData,
        InstructorId: user.Id,
        LearningObjectives: formData.LearningObjectives.filter(obj => obj.trim()),
        EstimatedDuration: '4-6 weeks', // Default duration
        CreatedDate: new Date().toISOString(),
        LastModified: new Date().toISOString()
      };

      const newCourse = await courseService.create(courseData);
      toast.success('Course created successfully!');
      navigate(`/courses/${newCourse.Id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Technology',
    'Business',
    'Design',
    'Marketing',
    'Health & Fitness',
    'Music',
    'Teaching & Academics',
    'Personal Development',
    'Photography',
    'Lifestyle'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/classes')}
            icon="ArrowLeft"
          >
            Back to Classes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600">Design your educational content and share knowledge</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ApperIcon name="BookOpen" size={20} className="mr-2" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Course Title *"
                value={formData.Title}
                onChange={(e) => handleInputChange('Title', e.target.value)}
                placeholder="Enter a compelling course title"
                className="text-lg"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  value={formData.Description}
                  onChange={(e) => handleInputChange('Description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="4"
                  placeholder="Describe what students will learn and why they should take this course"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.Category}
                    onChange={(e) => handleInputChange('Category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.DifficultyLevel}
                    onChange={(e) => handleInputChange('DifficultyLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Learning Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ApperIcon name="Target" size={20} className="mr-2" />
                Learning Objectives
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                icon="Plus"
              >
                Add Objective
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.LearningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <Input
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      placeholder="What will students learn or be able to do?"
                    />
                  </div>
                  {formData.LearningObjectives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(index)}
                      icon="Trash2"
                      className="text-red-500 hover:text-red-700"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Additional Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ApperIcon name="Settings" size={20} className="mr-2" />
              Additional Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <textarea
                  value={formData.Prerequisites}
                  onChange={(e) => handleInputChange('Prerequisites', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="3"
                  placeholder="What should students know before taking this course? (Optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Tags
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag (e.g., programming, design, business)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    disabled={!currentTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {formData.Tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.Tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-4"
        >
          <div className="text-sm text-gray-600">
            <ApperIcon name="Info" size={16} className="inline mr-1" />
            Course will be saved as draft. You can publish it later.
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/classes')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon="Save"
            >
              {loading ? 'Creating Course...' : 'Create Course'}
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default CreateCourse;