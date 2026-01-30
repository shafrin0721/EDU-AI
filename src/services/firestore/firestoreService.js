import { db } from '../../config/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,          // ✅ ADD THIS
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore'


class FirestoreService {
  /**
   * Collections Reference
   */
  collections = {
    users: 'users',
    courses: 'courses',
    modules: 'modules',
    lessons: 'lessons',
    enrollments: 'enrollments',
    assessments: 'assessments',
    learnings_sessions: 'learning_sessions',
    achievements: 'achievements',
    organizations: 'organizations',
    notifications: 'notifications'
  }

  /**
   * User Collection Operations
   */
  async createUser(uid, userData) {
    try {
      const userRef = doc(db, this.collections.users, uid)
      await setDoc(userRef, {
        uid,
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      }, { merge: true })
      return { uid, ...userData }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async getUser(uid) {
    try {
      const userRef = doc(db, this.collections.users, uid)
      const userSnap = await getDoc(userRef)
      return userSnap.exists() ? userSnap.data() : null
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, this.collections.users),
        where('email', '==', email)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.empty ? null : querySnapshot.docs[0].data()
    } catch (error) {
      console.error('Error fetching user by email:', error)
      throw error
    }
  }

  async updateUser(uid, updates) {
    try {
      const userRef = doc(db, this.collections.users, uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { uid, ...updates }
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async getUsersByRole(role) {
    try {
      const q = query(
        collection(db, this.collections.users),
        where('role', '==', role)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data())
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }
  }

  async getUsersByOrganization(organizationId) {
    try {
      const q = query(
        collection(db, this.collections.users),
        where('organizationId', '==', organizationId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data())
    } catch (error) {
      console.error('Error fetching organization users:', error)
      throw error
    }
  }

  /**
   * Course Collection Operations
   */
  async createCourse(courseData) {
    try {
      const courseRef = await addDoc(collection(db, this.collections.courses), {
        ...courseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        enrollmentCount: 0,
        rating: 0,
        reviews: []
      })
      return { id: courseRef.id, ...courseData }
    } catch (error) {
      console.error('Error creating course:', error)
      throw error
    }
  }

  async getCourse(courseId) {
    try {
      const courseRef = doc(db, this.collections.courses, courseId)
      const courseSnap = await getDoc(courseRef)
      return courseSnap.exists() ? courseSnap.data() : null
    } catch (error) {
      console.error('Error fetching course:', error)
      throw error
    }
  }

  async getCourses(filters = {}) {
    try {
      let q = collection(db, this.collections.courses)
      const conditions = []

      if (filters.category) {
        conditions.push(where('category', '==', filters.category))
      }
      if (filters.level) {
        conditions.push(where('level', '==', filters.level))
      }
      if (filters.instructorId) {
        conditions.push(where('instructorId', '==', filters.instructorId))
      }

      if (conditions.length > 0) {
        q = query(q, ...conditions, orderBy('createdAt', 'desc'))
      } else {
        q = query(q, orderBy('createdAt', 'desc'))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  }

  async updateCourse(courseId, updates) {
    try {
      const courseRef = doc(db, this.collections.courses, courseId)
      await updateDoc(courseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { id: courseId, ...updates }
    } catch (error) {
      console.error('Error updating course:', error)
      throw error
    }
  }

  /**
   * Module Collection Operations
   */
  async createModule(courseId, moduleData) {
    try {
      const moduleRef = await addDoc(collection(db, this.collections.modules), {
        ...moduleData,
        courseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lessonCount: 0
      })
      return { id: moduleRef.id, ...moduleData }
    } catch (error) {
      console.error('Error creating module:', error)
      throw error
    }
  }

  async getModulesByCourse(courseId) {
    try {
      const q = query(
        collection(db, this.collections.modules),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching modules:', error)
      throw error
    }
  }

  /**
   * Enrollment Collection Operations
   */
  async enrollUser(enrollmentData) {
    try {
      const enrollmentRef = await addDoc(
        collection(db, this.collections.enrollments),
        {
          ...enrollmentData,
          enrolledAt: serverTimestamp(),
          progress: 0,
          completed: false
        }
      )
      return { id: enrollmentRef.id, ...enrollmentData }
    } catch (error) {
      console.error('Error enrolling user:', error)
      throw error
    }
  }

  async getUserEnrollments(userId) {
    try {
      const q = query(
        collection(db, this.collections.enrollments),
        where('userId', '==', userId),
        orderBy('enrolledAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching user enrollments:', error)
      throw error
    }
  }

  async getCourseEnrollments(courseId) {
    try {
      const q = query(
        collection(db, this.collections.enrollments),
        where('courseId', '==', courseId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching course enrollments:', error)
      throw error
    }
  }

  async updateEnrollment(enrollmentId, updates) {
    try {
      const enrollmentRef = doc(db, this.collections.enrollments, enrollmentId)
      await updateDoc(enrollmentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { id: enrollmentId, ...updates }
    } catch (error) {
      console.error('Error updating enrollment:', error)
      throw error
    }
  }

  /**
   * Learning Session Operations
   */
  async createLearningSession(sessionData) {
    try {
      const sessionRef = await addDoc(
        collection(db, this.collections.learnings_sessions),
        {
          ...sessionData,
          startTime: serverTimestamp(),
          createdAt: serverTimestamp()
        }
      )
      return { id: sessionRef.id, ...sessionData }
    } catch (error) {
      console.error('Error creating learning session:', error)
      throw error
    }
  }

  async getUserLearningSessions(userId) {
    try {
      const q = query(
        collection(db, this.collections.learnings_sessions),
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching learning sessions:', error)
      throw error
    }
  }

  /**
   * Achievement Operations
   */
  async awardAchievement(achievementData) {
    try {
      const achievementRef = await addDoc(
        collection(db, this.collections.achievements),
        {
          ...achievementData,
          awardedAt: serverTimestamp()
        }
      )
      return { id: achievementRef.id, ...achievementData }
    } catch (error) {
      console.error('Error awarding achievement:', error)
      throw error
    }
  }

  async getUserAchievements(userId) {
    try {
      const q = query(
        collection(db, this.collections.achievements),
        where('userId', '==', userId),
        orderBy('awardedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching achievements:', error)
      throw error
    }
  }

  /**
   * Batch Operations
   */
  async batchCreateEnrollments(enrollments) {
    try {
      const batch = writeBatch(db)
      const enrollmentRefs = []

      for (const enrollment of enrollments) {
        const docRef = doc(collection(db, this.collections.enrollments))
        batch.set(docRef, {
          ...enrollment,
          enrolledAt: serverTimestamp(),
          progress: 0,
          completed: false
        })
        enrollmentRefs.push(docRef)
      }

      await batch.commit()
      return enrollmentRefs.map(ref => ref.id)
    } catch (error) {
      console.error('Error batch creating enrollments:', error)
      throw error
    }
  }

  /**
   * Transaction Operations
   */
  async updateProgressAndStreak(userId, progressData) {
    try {
      return await runTransaction(db, async (transaction) => {
        const userRef = doc(db, this.collections.users, userId)
        const userSnap = await transaction.get(userRef)

        if (!userSnap.exists()) {
          throw new Error('User not found')
        }

        const currentStreak = userSnap.data().learningStreak || 0
        const newStreak = currentStreak + 1

        transaction.update(userRef, {
          ...progressData,
          learningStreak: newStreak,
          updatedAt: serverTimestamp()
        })

        return { learningStreak: newStreak }
      })
    } catch (error) {
      console.error('Error updating progress and streak:', error)
      throw error
    }
  }
}

const firestoreService = new FirestoreService()
export { firestoreService }
export default firestoreService
