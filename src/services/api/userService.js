import { db } from '../../config/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class UserService {
  constructor() {
    this.collectionName = 'users'
    this.useFallback = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'
  }

  async makeRequest(endpoint, options = {}) {
    const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || 30000)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async getAll() {
    try {
      return await this.makeRequest('/users')
    } catch (error) {
      console.error('Error fetching all users:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      return await this.makeRequest(`/users/${id}`)
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  }

  async getByOrganization(organizationId) {
    try {
      return await this.makeRequest(`/users?organizationId=${organizationId}`)
    } catch (error) {
      console.error('Error fetching users by organization:', error)
      throw error
    }
  }

  async getByRole(role) {
    try {
      return await this.makeRequest(`/users?role=${role}`)
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }
  }

  async create(userData) {
    try {
      return await this.makeRequest('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async update(id, updates) {
    try {
      return await this.makeRequest(`/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async delete(id) {
    try {
      return await this.makeRequest(`/users/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  async updateProfile(userId, profileData) {
    try {
      return await this.makeRequest(`/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  async getUserAnalytics(userId) {
    try {
      return await this.makeRequest(`/users/${userId}/analytics`)
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      throw error
    }
  }

  async getTeacherStudents(teacherId) {
    try {
      return await this.makeRequest(`/users/${teacherId}/students`)
    } catch (error) {
      console.error('Error fetching teacher students:', error)
      throw error
    }
  }

  async getOrganizationUsers(organizationId, role = null) {
    try {
      const query = role ? `?role=${role}` : ''
      return await this.makeRequest(`/organizations/${organizationId}/users${query}`)
    } catch (error) {
      console.error('Error fetching organization users:', error)
      throw error
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      return await this.makeRequest(`/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }

  async getUserNotificationPreferences(userId) {
    try {
      return await this.makeRequest(`/users/${userId}/notification-preferences`)
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      throw error
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    try {
      return await this.makeRequest(`/users/${userId}/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      throw error
    }
  }

  async authenticate(email, password) {
    try {
      return await this.makeRequest('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
    } catch (error) {
      console.error('Error during authentication:', error)
      throw error
    }
  }

  async emailExists(email) {
    try {
      const response = await this.makeRequest(`/users/check-email?email=${encodeURIComponent(email)}`)
      return response.exists
    } catch (error) {
      console.error('Error checking email existence:', error)
      throw error
    }
  }
}

const userService = new UserService();
export { userService };
export default userService;