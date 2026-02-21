# EduAI Platform - Database Schema

## Overview

This document outlines the Firestore database schema for the EduAI adaptive learning platform.

---

## Collections

### 1. users

Stores user information for students, teachers, and administrators.

```
javascript
{
  id: string,                    // Unique identifier (Firebase UID)
  email: string,                 // User email address
  firstName: string,            // First name
  lastName: string,             // Last name
  role: string,                 // 'student' | 'teacher' | 'admin'
  avatar: string,                // URL to avatar image
  timezone: string,             // User timezone (e.g., 'UTC-8')
  organizationId: string,        // Reference to organization
  profile: {
    learningStreak: number,     // Days in a row of learning
    totalPoints: number,        // Total earned points
    level: number,              // Current user level
    department: string,          // For teachers/admins
    title: string,             // Job title
    preferences: {
      notifications: boolean,
      darkMode: boolean,
      emailUpdates: boolean
    }
  },
  permissions: {
    canCreateCourse: boolean,
    canManageUsers: boolean,
    canViewAnalytics: boolean,
    canEditProfile: boolean
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### 2. organizations

Multi-tenant organization settings.

```
javascript
{
  id: string,
  name: string,                 // Organization name
  domain: string,               // Email domain (e.g., 'university.edu')
  settings: {
    aiEnabled: boolean,         // Enable AI features
    adaptiveLearning: boolean,  // Enable adaptive learning
    maxStudents: number,
    features: string[]
  },
  subscription: {
    plan: string,              // 'free' | 'pro' | 'enterprise'
    status: string,            // 'active' | 'expired' | 'cancelled'
    expiresAt: timestamp
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### 3. courses

Course information and metadata.

```
javascript
{
  id: string,
  title: string,               // Course title
  description: string,         // Course description
  thumbnail: string,           // URL to thumbnail image
  InstructorId: string,         // Reference to users (teacher)
  organizationId: string,      // Reference to organization
  category: string,            // Course category
  difficulty: string,          // 'beginner' | 'intermediate' | 'advanced'
  duration: number,            // Estimated duration in minutes
  isPublished: boolean,
  isPremium: boolean,
  tags: string[],
  modules: string[],           // Array of module IDs
  rating: {
    average: number,
    count: number
  },
  enrollmentCount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp
}
```

---

### 4. modules

Course modules/chapters.

```
javascript
{
  id: string,
  courseId: string,            // Reference to courses
  title: string,               // Module title
  description: string,
  order: number,               // Display order
  estimatedDuration: number,    // In minutes
  isPublished: boolean,
  lessons: string[],           // Array of lesson IDs
  assessments: string[],        // Array of assessment IDs
  prerequisites: string[],      // Required module IDs
  difficulty: number,          // 1-5 scale
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### 5. lessons

Individual learning content items.

```
javascript
{
  id: string,
  moduleId: string,            // Reference to modules
  title: string,
  type: string,                // 'video' | 'reading' | 'interactive' | 'quiz'
  content: {
    videoUrl: string,
    textContent: string,
    interactiveElements: object[],
    quizQuestions: string[]
  },
  duration: number,            // Estimated time in minutes
  order: number,
  isPublished: boolean,
  resources: [{
    title: string,
    url: string,
    type: string
  }],
  difficulty: number,          // 1-5 scale
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### 6. enrollments

Tracks student course enrollments.

```
javascript
{
  id: string,
  userId: string,              // Reference to users (student)
  courseId: string,            // Reference to courses
  progress: number,            // 0-100 percentage
  status: string,              // 'active' | 'completed' | 'dropped'
  startedAt: timestamp,
  completedAt: timestamp,
  lastAccessedAt: timestamp,
  currentModuleId: string,     // Current position
  currentLessonId: string,
  timeSpent: number,           // Total time in seconds
  completionRate: number,       // Lessons completed percentage
  certificateIssued: boolean,
  certificateUrl: string
}
```

---

### 7. learning_sessions

Tracks individual learning sessions.

```
javascript
{
  id: string,
  userId: string,              // Reference to users
  courseId: string,
  moduleId: string,
  lessonId: string,
  startTime: timestamp,
  endTime: timestamp,
  duration: number,            // Session duration in seconds
  timeSpent: number,           // Actual active time
  interactions: number,        // Number of interactions
  completionStatus: string,    // 'started' | 'in_progress' | 'completed'
  videoProgress: {
    watchedSeconds: number,
    totalSeconds: number,
    percentage: number
  },
  quizScore: number,
  quizAnswers: object[],
  notes: string,
  createdAt: timestamp
}
```

---

### 8. assessments

Course assessments and quizzes.

```
javascript
{
  id: string,
  courseId: string,
  moduleId: string,
  title: string,               // Assessment title
  type: string,                 // 'quiz' | 'exam' | 'assignment' | 'project'
  questions: [{
    id: string,
    question: string,
    type: string,              // 'multiple_choice' | 'true_false' | 'short_answer' | 'code'
    options: string[],         // For multiple choice
    correctAnswer: string,
    points: number,
    explanation: string
  }],
  timeLimit: number,            // In minutes (0 = no limit)
  passingScore: number,         // Percentage required to pass
  maxAttempts: number,
  shuffleQuestions: boolean,
  showCorrectAnswers: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### 9. assessment_results

Student assessment submissions and results.

```
javascript
{
  id: string,
  userId: string,              // Reference to users
  assessmentId: string,
  courseId: string,
  score: number,               // Percentage score
  pointsEarned: number,
  totalPoints: number,
  passed: boolean,
  answers: [{
    questionId: string,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    pointsEarned: number
  }],
  timeSpent: number,           // Time in seconds
  attemptNumber: number,
  submittedAt: timestamp,
  gradedAt: timestamp,
  feedback: string
}
```

---

### 10. achievements

User achievements and badges.

```
javascript
{
  id: string,
  userId: string,              // Reference to users
  type: string,                 // 'course_completed' | 'streak' | 'mastery' | 'participation'
  title: string,
  description: string,
  icon: string,                // Icon name
  points: number,
  earnedAt: timestamp,
  metadata: object             // Additional achievement data
}
```

---

### 11. predictions (AI/ML)

Stores AI prediction data for accuracy tracking.

```
javascript
{
  id: string,
  learnerId: string,           // Reference to users
  courseId: string,
  moduleId: string,
  predictionType: string,       // 'performance' | 'difficulty' | 'engagement' | 'content'
  predictedScore: number,       // 0-1 normalized score
  actualScore: number,         // Actual result after completion
  error: number,                // |predicted - actual|
  isAccurate: boolean,         // Within threshold
  category: string,            // 'excellent' | 'proficient' | 'developing' | 'struggling'
  modelVersion: string,
  features: object,            // Input features used for prediction
  recommendation: string,      // AI recommendation made
  actualOutcome: string,       // What actually happened
  confidence: number,          // Model confidence 0-1
  createdAt: timestamp,
  validatedAt: timestamp       // When actual result was recorded
}
```

---

### 12. learning_paths

Generated personalized learning paths.

```
javascript
{
  id: string,
  userId: string,              // Reference to users
  courseId: string,
  title: string,
  description: string,
  path: [{
    moduleId: string,
    lessonId: string,
    order: number,
    estimatedTime: number,
    difficulty: string,
    reason: string             // Why this was recommended
  }],
  totalEstimatedTime: number,  // Total minutes
  difficultyProgression: string[],
  status: string,             // 'active' | 'completed' | 'abandoned'
  completionPercentage: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp
}
```

---

### 13. analytics_events

Tracking events for analytics.

```
javascript
{
  id: string,
  userId: string,
  eventType: string,           // 'page_view' | 'button_click' | 'video_play' | 'quiz_start'
  eventData: object,
  sessionId: string,
  url: string,
  userAgent: string,
  timestamp: timestamp
}
```

---

### 14. notifications

User notifications.

```
javascript
{
  id: string,
  userId: string,              // Reference to users
  type: string,                // 'achievement' | 'reminder' | 'feedback' | 'system'
  title: string,
  message: string,
  data: object,               // Additional notification data
  read: boolean,
  readAt: timestamp,
  createdAt: timestamp
}
```

---

## Indexes Recommended

```
javascript
// For analytics queries
enrollments: ['userId', 'courseId']
enrollments: ['courseId', 'status']

learning_sessions: ['userId', 'startTime']
learning_sessions: ['courseId', 'userId']

assessment_results: ['userId', 'assessmentId']
assessment_results: ['assessmentId', 'score']

predictions: ['learnerId', 'createdAt']
predictions: ['courseId', 'predictionType']
```

---

## Security Rules (firestore.rules)

```
javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Teachers can read enrollments for their courses
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Add proper role checks
    }

    // Read-only for authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'admin'];
    }

    // Analytics - admin only
    match /analytics_events/{eventId} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Relationships Diagram

```
users (1) ──────< enrollments (>1) ──────< courses
  │                  │                        │
  │                  │                        │
  └──< learning_sessions                    modules
  └──< assessment_results                    │
  └──< achievements                       lessons
  └──< predictions                        │
  └──< notifications                    assessments
  └──< learning_paths
```

---

## Example Queries

### Get teacher's courses

```
javascript
db.collection('courses')
  .where('InstructorId', '==', teacherId)
  .where('isPublished', '==', true)
  .orderBy('createdAt', 'desc')
```

### Get student progress

```
javascript
db.collection('enrollments')
  .where('userId', '==', studentId)
  .where('status', '==', 'active')
```

### Get AI predictions accuracy

```
javascript
db.collection('predictions')
  .where('learnerId', '==', studentId)
  .orderBy('createdAt', 'desc')
  .limit(100)
```
