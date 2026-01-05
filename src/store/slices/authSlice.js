import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: null,
  organization: null,
  isAuthenticated: false,
  availableRoles: [],
  sessionData: null,
  error: null
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const user = action.payload
      state.user = user
      state.isAuthenticated = true
      state.organization = {
        id: user.organizationId || "org_001",
        name: "Global University",
        domain: "university.edu",
        settings: {
          aiEnabled: true,
          adaptiveLearning: true
        }
      }
      state.availableRoles = [user.role]
      state.sessionData = {
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }
      state.error = null
      
      // Store in localStorage for persistence
      localStorage.setItem('eduai_auth', JSON.stringify({
        user: user,
        isAuthenticated: true,
        sessionData: state.sessionData
      }))
    },
    
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      state.isAuthenticated = true
      if (state.sessionData) {
        state.sessionData.lastActivity = new Date().toISOString()
      }
    },
    
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user.profile = { ...state.user.profile, ...action.payload }
        if (state.sessionData) {
          state.sessionData.lastActivity = new Date().toISOString()
        }
      }
    },
    
    updateUserPreferences: (state, action) => {
      if (state.user?.profile) {
        state.user.profile.preferences = { 
          ...state.user.profile.preferences, 
          ...action.payload 
        }
      }
    },
    
    setOrganization: (state, action) => {
      state.organization = action.payload
    },
    
    logout: (state) => {
      localStorage.removeItem('eduai_auth')
      return {
        ...initialState,
        error: null
      }
    },
    
    switchRole: (state, action) => {
      if (!state.user) return
      
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
      if (state.sessionData) {
        state.sessionData.lastActivity = new Date().toISOString()
      }
    },
    
    setAvailableRoles: (state, action) => {
      state.availableRoles = action.payload
    },
    
    updateLearningStreak: (state, action) => {
      if (state.user?.profile) {
        state.user.profile.learningStreak = action.payload
      }
    },
    
    addPoints: (state, action) => {
      if (state.user?.profile) {
        state.user.profile.totalPoints += action.payload
        // Level up calculation
        const newLevel = Math.floor(state.user.profile.totalPoints / 1000) + 1
        if (newLevel > state.user.profile.level) {
          state.user.profile.level = newLevel
        }
      }
    },
    
    updateLastActivity: (state) => {
      if (state.sessionData) {
        state.sessionData.lastActivity = new Date().toISOString()
      }
    },
    
    setError: (state, action) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    restoreAuth: (state, action) => {
      const { user, sessionData } = action.payload
      state.user = user
      state.isAuthenticated = true
      state.organization = {
        id: user.organizationId || "org_001",
        name: "Global University", 
        domain: "university.edu",
        settings: {
          aiEnabled: true,
          adaptiveLearning: true
        }
      }
      state.availableRoles = [user.role]
      state.sessionData = sessionData
    }
  },
})

export const { 
  login,
  setUser, 
  updateUserProfile,
  updateUserPreferences,
  setOrganization, 
  logout, 
  switchRole,
  setAvailableRoles,
  updateLearningStreak,
  addPoints,
  updateLastActivity,
  setError,
  clearError,
  restoreAuth
} = authSlice.actions

export default authSlice.reducer