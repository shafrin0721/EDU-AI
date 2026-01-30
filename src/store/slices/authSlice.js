import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../../config/firebase'

// Firebase Authentication Thunks
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
      
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth)
      return null
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  user: null,
  organization: null,
  isAuthenticated: false,
  availableRoles: [],
  sessionData: null,
  error: null,
  loading: false
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
      state.loading = false
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
  extraReducers: (builder) => {
    // Handle registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.sessionData = {
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
    
    // Handle loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.sessionData = {
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
    
    // Handle logoutUser
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.sessionData = null
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
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