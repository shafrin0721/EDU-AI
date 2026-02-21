import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyCe1UvSuyux3W4yQ2QGHekMshSNOhwcvOg",
  authDomain: "eduai-bfb25.firebaseapp.com",
  projectId: "eduai-bfb25",
  storageBucket: "eduai-bfb25.firebasestorage.app",
  messagingSenderId: "105051733644",
  appId: "1:105051733644:web:e6abc3806dfe4873ad45a9",
  measurementId: "G-0BP6LV39FR"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const realtimeDb = getDatabase(app)

// Initialize Analytics (only in browser environment)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}
export { analytics }

export default app
