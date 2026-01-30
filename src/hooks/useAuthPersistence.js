import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { login, logout } from '@/store/slices/authSlice'
import firestoreService from '@/services/firestore/firestoreService'

export const useAuthPersistence = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userData = await firestoreService.getUser(user.uid)
          
          if (userData) {
            // User exists in Firestore
            dispatch(login({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              ...userData
            }))
          } else {
            // First time user - create basic profile
            const basicProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || null,
              role: 'student',
              organizationId: 'org_001',
              createdAt: new Date().toISOString()
            }

            // Store in Firestore
            await firestoreService.createUser(user.uid, basicProfile)
            
            dispatch(login(basicProfile))
          }
        } catch (error) {
          console.error('Error loading user data:', error)
          // Still log them in even if Firestore fails
          dispatch(login({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }))
        }
      } else {
        // User logged out
        dispatch(logout())
      }
    })

    return () => unsubscribe()
  }, [dispatch])
}
