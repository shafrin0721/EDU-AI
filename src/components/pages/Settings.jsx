import React, { useEffect, useState } from "react";
import { Bell, Database, Globe, Mail, Save, Shield, Smartphone, User } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import userService from "@/services/api/userService";
import Profile from "@/components/pages/Profile";

const Settings = () => {
  const { user } = useSelector(state => state.auth);
  
  const [settings, setSettings] = useState({
    general: {
      platformName: 'EduAI Platform',
      supportEmail: 'support@eduai.com',
      timezone: 'UTC-5',
      language: 'en'
    },
    notifications: {
      email: true,
      push: true,
      achievements: true,
      reminders: true,
      contentUpdates: false,
      systemAlerts: true
    },
    profile: {
      displayName: user?.name || '',
      email: user?.email || '',
      bio: '',
      learningGoals: ''
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    integrations: {
      googleClassroom: false,
      microsoftTeams: true,
      slack: false,
      zoom: true
    }
});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    loadUserPreferences();
  }, [user?.Id]);

  const loadUserPreferences = async () => {
    if (!user?.Id) return;
    
    try {
      const preferences = await userService.getUserNotificationPreferences(user.Id);
      if (preferences) {
        setSettings(prev => ({
          ...prev,
          notifications: preferences,
          profile: {
            ...prev.profile,
            displayName: user.name,
            email: user.email
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user?.Id) {
        await userService.updateNotificationPreferences(user.Id, settings.notifications);
        toast.success('Settings saved successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your platform configuration and preferences</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              ✓
            </div>
            Settings saved successfully!
          </div>
        </div>
      )}
{/* Profile Settings - Students and Teachers */}
      {(isStudent || isTeacher) && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <Input
                value={settings.profile.displayName}
                onChange={(e) => handleSettingChange('profile', 'displayName', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={settings.profile.bio}
                onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            {isStudent && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Goals
                </label>
                <textarea
                  value={settings.profile.learningGoals}
                  onChange={(e) => handleSettingChange('profile', 'learningGoals', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="What are your learning goals?"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* General Settings - Admin Only */}
      {isAdmin && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <Input
                value={settings.general.platformName}
                onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <Input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="UTC-5">UTC-5 (Eastern)</option>
                <option value="UTC-6">UTC-6 (Central)</option>
                <option value="UTC-7">UTC-7 (Mountain)</option>
                <option value="UTC-8">UTC-8 (Pacific)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language
              </label>
              <select
                value={settings.general.language}
                onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </Card>
      )}

{/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-gray-500">
                  {key === 'email' && 'Receive email notifications for important updates'}
                  {key === 'push' && 'Get push notifications on your device'}
                  {key === 'achievements' && 'Notifications when you earn achievements'}
                  {key === 'reminders' && 'Study reminders and deadlines'}
                  {key === 'contentUpdates' && 'New content and course updates'}
                  {key === 'systemAlerts' && 'System maintenance and alerts'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

{/* Security - Teachers and Admins */}
      {(isTeacher || isAdmin) && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">Add extra security to your account</div>
              </div>
              <Badge variant={settings.security.twoFactorAuth ? 'success' : 'secondary'}>
                {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Expiry (days)
                  </label>
                  <Input
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

{/* Integrations - Teachers and Admins Only */}
      {(isTeacher || isAdmin) && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.integrations).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    {key === 'googleClassroom' && <Mail className="h-4 w-4 text-primary-600" />}
                    {key === 'microsoftTeams' && <Smartphone className="h-4 w-4 text-primary-600" />}
                    {key === 'slack' && <Bell className="h-4 w-4 text-primary-600" />}
                    {key === 'zoom' && <Globe className="h-4 w-4 text-primary-600" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {value ? 'Connected' : 'Not connected'}
                    </div>
                  </div>
                </div>
                <Button
                  variant={value ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleSettingChange('integrations', key, !value)}
                >
                  {value ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;