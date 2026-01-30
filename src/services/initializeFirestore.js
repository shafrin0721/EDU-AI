import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore'

const sampleCourses = [
  {
    title: 'Introduction to React',
    description: 'Learn the basics of React, hooks, and component lifecycle',
    category: 'Web Development',
    level: 'beginner',
    duration: '4 weeks',
    instructor: 'John Doe',
    instructorId: 'teacher1',
    image: '/api/placeholder/400/200',
    rating: 4.8,
    enrollmentCount: 342,
    status: 'published'
  },
  {
    title: 'Advanced JavaScript',
    description: 'Master closures, async/await, and modern JavaScript patterns',
    category: 'Programming',
    level: 'advanced',
    duration: '6 weeks',
    instructor: 'Jane Smith',
    instructorId: 'teacher2',
    image: '/api/placeholder/400/200',
    rating: 4.9,
    enrollmentCount: 521,
    status: 'published'
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python, pandas, numpy, and scikit-learn for data analysis',
    category: 'Data Science',
    level: 'intermediate',
    duration: '8 weeks',
    instructor: 'Dr. Mike Johnson',
    instructorId: 'teacher3',
    image: '/api/placeholder/400/200',
    rating: 4.7,
    enrollmentCount: 278,
    status: 'published'
  },
  {
    title: 'Web Design Fundamentals',
    description: 'Create beautiful and responsive web designs with CSS and HTML',
    category: 'Design',
    level: 'beginner',
    duration: '3 weeks',
    instructor: 'Sarah Wilson',
    instructorId: 'teacher4',
    image: '/api/placeholder/400/200',
    rating: 4.6,
    enrollmentCount: 410,
    status: 'published'
  },
  {
    title: 'Mobile App Development',
    description: 'Build cross-platform mobile apps with React Native',
    category: 'Mobile Development',
    level: 'intermediate',
    duration: '7 weeks',
    instructor: 'Alex Kumar',
    instructorId: 'teacher5',
    image: '/api/placeholder/400/200',
    rating: 4.8,
    enrollmentCount: 198,
    status: 'published'
  }
]

const sampleModules = [
  {
    title: 'Getting Started with React',
    description: 'Introduction to React concepts',
    order: 1,
    lessons: 5,
    duration: '2 hours'
  },
  {
    title: 'Components and Props',
    description: 'Understanding React components and props system',
    order: 2,
    lessons: 6,
    duration: '3 hours'
  },
  {
    title: 'Hooks and State',
    description: 'Using useState, useEffect, and custom hooks',
    order: 3,
    lessons: 7,
    duration: '4 hours'
  },
  {
    title: 'Advanced Patterns',
    description: 'Context API, Custom Hooks, and Performance Optimization',
    order: 4,
    lessons: 5,
    duration: '3 hours'
  }
]

const sampleLessons = [
  {
    title: 'What is React?',
    duration: '15 min',
    videoUrl: '/api/placeholder/video',
    content: 'React is a JavaScript library for building user interfaces with reusable components.'
  },
  {
    title: 'Setting Up Your Environment',
    duration: '20 min',
    videoUrl: '/api/placeholder/video',
    content: 'Learn how to set up Node.js, npm, and create a new React project.'
  },
  {
    title: 'JSX Basics',
    duration: '25 min',
    videoUrl: '/api/placeholder/video',
    content: 'Understanding JSX syntax and how it translates to JavaScript.'
  },
  {
    title: 'Rendering Elements',
    duration: '18 min',
    videoUrl: '/api/placeholder/video',
    content: 'Learn how to render React elements to the DOM.'
  },
  {
    title: 'Your First Component',
    duration: '22 min',
    videoUrl: '/api/placeholder/video',
    content: 'Create your first functional React component.'
  }
]

const sampleAchievements = [
  {
    name: 'First Step',
    description: 'Complete your first course',
    icon: 'Star',
    points: 10,
    color: 'yellow'
  },
  {
    name: 'Learning Streak',
    description: 'Complete 7 days of learning in a row',
    icon: 'Flame',
    points: 50,
    color: 'orange'
  },
  {
    name: 'Master Learner',
    description: 'Complete 5 courses',
    icon: 'Trophy',
    points: 100,
    color: 'gold'
  },
  {
    name: 'Quick Learner',
    description: 'Complete a course in under 1 week',
    icon: 'Zap',
    points: 25,
    color: 'blue'
  },
  {
    name: 'Perfect Score',
    description: 'Score 100% on an assessment',
    icon: 'Award',
    points: 75,
    color: 'purple'
  }
]

export async function initializeFirestoreData() {
  try {
    console.log('Starting Firestore initialization...')
    
    // Create sample courses
    console.log('Creating courses...')
    const courseRefs = []
    for (const courseData of sampleCourses) {
      const courseRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      courseRefs.push({ ref: courseRef, data: courseData })
      console.log(`Created course: ${courseData.title}`)
    }
    
    // Create modules for each course
    console.log('Creating modules...')
    for (const { ref: courseRef } of courseRefs) {
      for (const moduleData of sampleModules) {
        const moduleDocRef = await addDoc(
          collection(db, 'courses', courseRef.id, 'modules'),
          {
            ...moduleData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
        )
        console.log(`  ✅ ${moduleData.title}`)
        
        // Create lessons for each module
        for (const lessonData of sampleLessons) {
          await addDoc(
            collection(db, 'courses', courseRef.id, 'modules', moduleDocRef.id, 'lessons'),
            {
              ...lessonData,
              createdAt: serverTimestamp()
            }
          )
        }
      }
    }
    
    // Create sample organization
    console.log('🏢 Creating organization...')
    await addDoc(collection(db, 'organizations'), {
      name: 'Global University',
      domain: 'university.edu',
      settings: {
        aiEnabled: true,
        adaptiveLearning: true
      },
      createdAt: serverTimestamp()
    })
    console.log('  ✅ Global University')
    
    // Create sample achievements
    console.log('🏆 Creating achievements...')
    for (const achievementData of sampleAchievements) {
      await addDoc(collection(db, 'achievements'), {
        ...achievementData,
        createdAt: serverTimestamp()
      })
      console.log(`  ✅ ${achievementData.name}`)
    }
    
    console.log('\n✨ Firestore initialization complete!')
    console.log('📊 Collections created:')
    console.log('  • courses (5 courses)')
    console.log('  • modules (20 modules)')
    console.log('  • lessons (100 lessons)')
    console.log('  • organizations')
    console.log('  • achievements\n')
    return true
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error)
    throw error
  }
}

/**
 * Quick check: are we connected to Firestore?
 */
export async function checkFirestoreConnection() {
  try {
    const testRef = doc(db, 'test-connection', 'ping')
    await setDoc(testRef, { timestamp: serverTimestamp() }, { merge: true })
    console.log('✅ Firestore connection active')
    return true
  } catch (error) {
    console.error('❌ Firestore connection failed:', error)
    return false
  }
}

export default {
  initializeFirestoreData,
  checkFirestoreConnection
}
