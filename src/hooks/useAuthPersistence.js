import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { login, logout } from '@/store/slices/authSlice'

// Mock user mapping - maps any logged-in user to demo student data
const getMockUserData = (firebaseUser) => {
  // Always return student data for demo purposes
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

export const useAuthPersistence = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Use mock user data for demo - maps any Firebase user to demo student
        const mockUserData = getMockUserData(user)
        
        dispatch(login(mockUserData))
        console.log('User logged in:', mockUserData.email, 'as', mockUserData.role)
      } else {
        // User logged out
        dispatch(logout())
      }
    })

    return () => unsubscribe()
  }, [dispatch])
}
