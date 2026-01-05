import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: {
    Id: 1,
    email: "alex.chen@university.edu",
    role: "student",
    organizationId: "org_001",
    profile: {
      firstName: "Alex",
      lastName: "Chen",
      avatar: "/api/placeholder/40/40",
      learningStreak: 7,
      totalPoints: 2450,
      level: 3,
      timezone: "America/New_York",
      preferences: {
        learning: {
          preferredDifficulty: "intermediate"
        },
        notifications: {
          email: true,
          push: true,
          achievements: true
        }
      }
    },
    permissions: {
      canCreateCourse: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canEditProfile: true
    }
  },
  organization: {
    id: "org_001",
    name: "Global University",
    domain: "university.edu",
    settings: {
      aiEnabled: true,
      adaptiveLearning: true
    }
  },
  isAuthenticated: true,
  availableRoles: ["student"],
  sessionData: {
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      state.isAuthenticated = true
      state.sessionData.lastActivity = new Date().toISOString()
    },
    updateUserProfile: (state, action) => {
      state.user.profile = { ...state.user.profile, ...action.payload }
      state.sessionData.lastActivity = new Date().toISOString()
    },
    updateUserPreferences: (state, action) => {
      state.user.profile.preferences = { 
        ...state.user.profile.preferences, 
        ...action.payload 
      }
    },
    setOrganization: (state, action) => {
      state.organization = action.payload
    },
    logout: (state) => {
      return initialState
    },
    switchRole: (state, action) => {
      const newRole = action.payload
      state.user.role = newRole
      
      // Update permissions based on role
      switch (newRole) {
        case "student":
          state.user.permissions = {
            canCreateCourse: false,
            canManageUsers: false,
            canViewAnalytics: false,
            canEditProfile: true
          }
          break
        case "teacher":
          state.user.permissions = {
            canCreateCourse: true,
            canManageUsers: false,
            canViewAnalytics: true,
            canEditProfile: true
          }
          break
        case "admin":
          state.user.permissions = {
            canCreateCourse: true,
            canManageUsers: true,
            canViewAnalytics: true,
            canEditProfile: true
          }
          break
      }
      state.sessionData.lastActivity = new Date().toISOString()
    },
    setAvailableRoles: (state, action) => {
      state.availableRoles = action.payload
    },
    updateLearningStreak: (state, action) => {
      state.user.profile.learningStreak = action.payload
    },
    addPoints: (state, action) => {
      state.user.profile.totalPoints += action.payload
      // Level up calculation
      const newLevel = Math.floor(state.user.profile.totalPoints / 1000) + 1
      if (newLevel > state.user.profile.level) {
        state.user.profile.level = newLevel
      }
    },
    updateLastActivity: (state) => {
      state.sessionData.lastActivity = new Date().toISOString()
    }
  },
})

export const { 
  setUser, 
  updateUserProfile,
  updateUserPreferences,
  setOrganization, 
  logout, 
  switchRole,
  setAvailableRoles,
  updateLearningStreak,
  addPoints,
  updateLastActivity
} = authSlice.actions
export default authSlice.reducer