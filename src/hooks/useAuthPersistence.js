import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { login, logout } from '@/store/slices/authSlice'
import firestoreService from '@/services/firestore/firestoreService'

// Default mock user data - used when no Firestore data is available
const getDefaultMockUserData = (firebaseUser) => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || 'Alex Chen',
    photoURL: firebaseUser.photoURL || null,
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
    },
    organizationId: 'org_001'
  }
}

// Get mock user data based on email - for demo accounts
const getMockUserByEmail = (email) => {
  const mockUsers = {
    'alex.chen@university.edu': {
      Id: 1,
      role: 'student',
      FirstName: 'Alex',
      LastName: 'Chen',
      profile: { firstName: 'Alex', lastName: 'Chen', learningStreak: 15, totalPoints: 2450, level: 8 }
    },
    'sarah.johnson@university.edu': {
      Id: 2,
      role: 'teacher',
      FirstName: 'Sarah',
      LastName: 'Johnson',
      profile: { firstName: 'Sarah', lastName: 'Johnson', department: 'Computer Science', title: 'Assistant Professor' }
    },
    'michael.admin@university.edu': {
      Id: 3,
      role: 'admin',
      FirstName: 'Michael',
      LastName: 'Roberts',
      profile: { firstName: 'Michael', lastName: 'Roberts', department: 'IT Administration', title: 'Learning Platform Administrator' }
    },
    'teacher@eduai.com': {
      Id: 2,
      role: 'teacher',
      FirstName: 'John',
      LastName: 'Smith',
      profile: { firstName: 'John', lastName: 'Smith', department: 'Mathematics', title: 'Senior Lecturer' }
    },
    'admin@eduai.com': {
      Id: 3,
      role: 'admin',
      FirstName: 'Admin',
      LastName: 'User',
      profile: { firstName: 'Admin', lastName: 'User', department: 'Administration', title: 'System Administrator' }
    },
    'superadmin@eduai.com': {
      Id: 3,
      role: 'admin',
      FirstName: 'Super',
      LastName: 'Admin',
      profile: { firstName: 'Super', lastName: 'Admin', department: 'IT', title: 'Super Administrator' }
    }
  }
  return mockUsers[email] || null
}

export const useAuthPersistence = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Try to get user data from Firestore first
          let firestoreUser = null
          try {
            firestoreUser = await firestoreService.getUserByEmail(user.email)
          } catch (e) {
            console.log('Firestore lookup failed, trying mock data')
          }
          
          let userData
          
          // If user exists in Firestore, use that data
          if (firestoreUser && firestoreUser.role) {
            userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || `${firestoreUser.firstName} ${firestoreUser.lastName}`,
              photoURL: user.photoURL || null,
              Id: firestoreUser.Id || 999,
              role: firestoreUser.role,
              FirstName: firestoreUser.firstName,
              LastName: firestoreUser.lastName,
              profile: firestoreUser.profile || {
                firstName: firestoreUser.firstName,
                lastName: firestoreUser.lastName
              },
              organizationId: firestoreUser.organizationId || 'org_001'
            }
          } else {
            // Try mock user data by email
            const mockUser = getMockUserByEmail(user.email)
            
            if (mockUser) {
              userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || `${mockUser.FirstName} ${mockUser.LastName}`,
                photoURL: user.photoURL || null,
                Id: mockUser.Id,
                role: mockUser.role,
                FirstName: mockUser.FirstName,
                LastName: mockUser.LastName,
                profile: mockUser.profile,
                organizationId: 'org_001'
              }
            } else {
              // Fall back to default student data
              userData = getDefaultMockUserData(user)
            }
          }
        
          dispatch(login(userData))
          console.log('User logged in:', userData.email, 'as', userData.role)
        } catch (error) {
          console.error('Error in auth persistence:', error)
          // Fall back to default on error
          const defaultData = getDefaultMockUserData(user)
          dispatch(login(defaultData))
        }
      } else {
        // User logged out
        dispatch(logout())
      }
    })

    return () => unsubscribe()
  }, [dispatch])
}
