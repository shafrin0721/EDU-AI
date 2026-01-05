import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Award, Calendar, Camera, Globe, Mail, MapPin, Phone, Save, Bell, Lock } from "lucide-react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { updateUserProfile } from "@/store/slices/authSlice";
import userService from "@/services/api/userService";
import Settings from "@/components/pages/Settings";

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    expertise: [],
    experience: '',
    education: ''
  });
const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC-8',
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    theme: 'light',
    privacy: 'public'
  });
  useEffect(() => {
    if (user?.profile) {
      setProfile({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        email: user.email || '',
        phone: user.profile.phone || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        website: user.profile.website || '',
        expertise: user.profile.expertise || [],
        experience: user.profile.experience || '',
        education: user.profile.education || ''
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
setSaving(true);
    try {
      await userService.updateProfile(user?.id, profile);
      dispatch(updateUserProfile(profile));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset profile to original values
    if (user?.profile) {
      setProfile({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        email: user.email || '',
        phone: user.profile.phone || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        website: user.profile.website || '',
        expertise: user.profile.expertise || [],
        experience: user.profile.experience || '',
        education: user.profile.education || ''
      });
    }
    setIsEditing(false);
  };

  const addExpertise = () => {
    const expertise = prompt('Add a skill or area of expertise:');
    if (expertise && expertise.trim()) {
      handleProfileChange('expertise', [...profile.expertise, expertise.trim()]);
    }
  };

  const removeExpertise = (index) => {
handleProfileChange('expertise', profile.expertise.filter((_, i) => i !== index));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userService.updateProfile(user?.id, profile);
      dispatch(updateUserProfile(profile));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
                icon="Save"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              icon="Edit"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex items-start space-x-6">
<div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.firstName?.[0] || 'U'}{profile.lastName?.[0] || 'S'}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                <Camera size={16} />
              </button>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  placeholder="First name"
                />
                <Input
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="primary" className="capitalize">
                    {user?.role}
                  </Badge>
                  {user?.organizationId && (
                    <span className="text-sm text-gray-500">
                      {user.organizationId}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {profile.bio && !isEditing && (
              <p className="text-gray-600">{profile.bio}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {isEditing ? (
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="Email address"
                icon="Mail"
                disabled
                className="bg-gray-50"
              />
            ) : (
              <div className="flex items-center text-gray-900">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {profile.email}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            {isEditing ? (
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="Phone number"
                icon="Phone"
              />
            ) : (
              <div className="flex items-center text-gray-900">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                {profile.phone || 'Not provided'}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            {isEditing ? (
              <Input
                value={profile.location}
                onChange={(e) => handleProfileChange('location', e.target.value)}
                placeholder="City, State"
                icon="MapPin"
              />
            ) : (
              <div className="flex items-center text-gray-900">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {profile.location || 'Not provided'}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            {isEditing ? (
              <Input
                type="url"
                value={profile.website}
                onChange={(e) => handleProfileChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                icon="Globe"
              />
            ) : (
              <div className="flex items-center text-gray-900">
                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                {profile.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    {profile.website}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Bio Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="4"
                placeholder="Tell us about yourself, your experience, and interests..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <Input
                  value={profile.experience}
                  onChange={(e) => handleProfileChange('experience', e.target.value)}
                  placeholder="e.g., 5+ years"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <Input
                  value={profile.education}
                  onChange={(e) => handleProfileChange('education', e.target.value)}
                  placeholder="e.g., PhD in Computer Science"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {profile.bio && (
              <p className="text-gray-700">{profile.bio}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-gray-900">{profile.experience}</p>
                </div>
              )}
              
              {profile.education && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <p className="text-gray-900">{profile.education}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Expertise & Skills */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Expertise & Skills
          </h3>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={addExpertise}
              icon="Plus"
            >
              Add Skill
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {profile.expertise.length > 0 ? (
            profile.expertise.map((skill, index) => (
              <div key={index} className="flex items-center">
                <Badge variant="secondary">
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeExpertise(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>
      </Card>
</Card>
    </div>
  );
};

export default Profile;