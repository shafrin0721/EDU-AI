/\*\*

- Firestore Setup Instructions
-
- Follow these steps to complete Firestore setup:
-
- 1.  DEPLOY SECURITY RULES
- - Go to Firebase Console: https://console.firebase.google.com/
- - Select your project: "eduai-bfb25"
- - Go to Firestore Database → Rules tab
- - Replace the existing rules with content from firestore.rules file
- - Click Publish
-
- 2.  INITIALIZE COLLECTIONS (Choose one method):
-
- METHOD A: Using Firebase Console (Manual)
- - Create collections one by one via Firebase UI:
-      • users
-      • courses
-      • modules
-      • lessons
-      • enrollments
-      • learning_sessions
-      • assessments
-      • achievements
-      • notifications
-      • organizations
-
- METHOD B: Using Initialization Function (Recommended)
- - Run in browser console after app loads:
-
-      import { initializeFirestoreData } from '@/services/initializeFirestore'
-      await initializeFirestoreData()
-
- METHOD C: Using Cloud Functions (Advanced)
- - Deploy sample data via Cloud Function
-
- 3.  VERIFY DATA
- - Go to Firebase Console → Firestore Database → Data tab
- - You should see collections created with sample data
-
- 4.  TEST THE APP
- - Register a new user
- - Verify user data appears in Firestore
- - Browse courses and modules
- - Test enrollments and learning sessions
    \*/

// Collection names (use these consistently)
export const COLLECTIONS = {
USERS: 'users',
COURSES: 'courses',
MODULES: 'modules',
LESSONS: 'lessons',
ENROLLMENTS: 'enrollments',
LEARNING_SESSIONS: 'learning_sessions',
ASSESSMENTS: 'assessments',
ACHIEVEMENTS: 'achievements',
NOTIFICATIONS: 'notifications',
ORGANIZATIONS: 'organizations'
}

// Subcollections
export const SUBCOLLECTIONS = {
MODULES: 'modules', // Under courses
LESSONS: 'lessons', // Under modules
}

export const FIRESTORE_SETUP = {
collections: [
{
name: 'users',
description: 'User profiles and authentication data',
fields: ['email', 'displayName', 'role', 'createdAt']
},
{
name: 'courses',
description: 'Course information and metadata',
fields: ['title', 'description', 'category', 'level', 'instructorId']
},
{
name: 'modules',
description: 'Course modules (subcollection under courses)',
fields: ['title', 'order', 'lessons', 'duration']
},
{
name: 'lessons',
description: 'Individual lessons (subcollection under modules)',
fields: ['title', 'videoUrl', 'content', 'duration']
},
{
name: 'enrollments',
description: 'User course enrollments',
fields: ['userId', 'courseId', 'progress', 'completed', 'enrolledAt']
},
{
name: 'learning_sessions',
description: 'Learning session tracking',
fields: ['userId', 'courseId', 'startTime', 'duration', 'completed']
},
{
name: 'assessments',
description: 'Course assessments and quizzes',
fields: ['title', 'courseId', 'questions', 'passingScore']
},
{
name: 'achievements',
description: 'User achievements and badges',
fields: ['name', 'description', 'userId', 'awardedAt', 'points']
},
{
name: 'notifications',
description: 'User notifications',
fields: ['userId', 'title', 'message', 'read', 'createdAt']
},
{
name: 'organizations',
description: 'Organization/Institution data',
fields: ['name', 'domain', 'settings', 'createdAt']
}
]
}
