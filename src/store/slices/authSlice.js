import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../../config/firebase'
import firestoreService from '../../services/firestore/firestoreService'

// Mock user data for demo - maps email to user profile
const mockUsers = {
  'alex.chen@university.edu': {
    Id: 1,
    role: 'student',
    FirstName: 'Alex',
    LastName: 'Chen',
    profile: {
      firstName: 'Alex',
      lastName: 'Chen',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-8',
      learningStreak: 15,
      totalPoints: 2450,
      level: 8
    }
  },
  'sarah.johnson@university.edu': {
    Id: 2,
    role: 'teacher',
    FirstName: 'Sarah',
    LastName: 'Johnson',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-8',
      department: 'Computer Science',
      title: 'Assistant Professor'
    }
  },
  'michael.admin@university.edu': {
    Id: 3,
    role: 'admin',
    FirstName: 'Michael',
    LastName: 'Roberts',
    profile: {
      firstName: 'Michael',
      lastName: 'Roberts',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-8',
      department: 'IT Administration',
      title: 'Learning Platform Administrator'
    }
  },
  'teacher@eduai.com': {
    Id: 2,
    role: 'teacher',
    FirstName: 'John',
    LastName: 'Smith',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-8',
      department: 'Mathematics',
      title: 'Senior Lecturer'
    }
  },
  'instructor@eduai.com': {
    Id: 2,
    role: 'teacher',
    FirstName: 'Emily',
    LastName: 'Davis',
    profile: {
      firstName: 'Emily',
      lastName: 'Davis',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-5',
      department: 'Physics',
      title: 'Professor'
    }
  },
  'admin@eduai.com': {
    Id: 3,
    role: 'admin',
    FirstName: 'Admin',
    LastName: 'User',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-8',
      department: 'Administration',
      title: 'System Administrator'
    }
  },
  'superadmin@eduai.com': {
    Id: 3,
    role: 'admin',
    FirstName: 'Super',
    LastName: 'Admin',
    profile: {
      firstName: 'Super',
      lastName: 'Admin',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-0',
      department: 'IT',
      title: 'Super Administrator'
    }
  },
  'student@eduai.com': {
    Id: 1,
    role: 'student',
    FirstName: 'Alex',
    LastName: 'Chen',
    profile: {
      firstName: 'Alex',
      lastName: 'Chen',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-8',
      learningStreak: 15,
      totalPoints: 2450,
      level: 8
    }
  },
  'default': {
    Id: 1,
    role: 'student',
    FirstName: 'Alex',
    LastName: 'Chen',
    profile: {
      firstName: 'Alex',
      lastName: 'Chen',
      avatar: '/api/placeholder/40/40',
      timezone: 'UTC-8',
      learningStreak: 15,
      totalPoints: 2450,
      level: 8
    }
  }
}

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
      
      // Try to get user data from Firestore first
      let firestoreUser = null
      try {
        firestoreUser = await firestoreService.getUserByEmail(email)
      } catch (e) {
        console.log('Firestore lookup failed, using mock data')
      }
      
      // If user exists in Firestore, use that data
      if (firestoreUser && firestoreUser.role) {
        return {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || `${firestoreUser.firstName} ${firestoreUser.lastName}`,
          photoURL: result.user.photoURL,
          Id: firestoreUser.Id || 999,
          role: firestoreUser.role,
          FirstName: firestoreUser.firstName,
          LastName: firestoreUser.lastName,
          profile: firestoreUser.profile || { firstName: firestoreUser.firstName, lastName: firestoreUser.lastName }
        }
      }
      
      // Fallback to mock user data
      const mockUser = mockUsers[email] || mockUsers['default']
      
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || `${mockUser.FirstName} ${mockUser.LastName}`,
        photoURL: result.user.photoURL,
        Id: mockUser.Id,
        role: mockUser.role,
        FirstName: mockUser.FirstName,
        LastName: mockUser.LastName,
        profile: mockUser.profile
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
