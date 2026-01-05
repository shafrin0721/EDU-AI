import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  selectedCourse: null,
  currentModule: null,
  currentLesson: null,
  notifications: [],
  sidebarCollapsed: false,
  analytics: {
    loading: false,
    data: null,
    error: null
  },
  courseCreation: {
    step: 1,
    data: {},
    loading: false
  },
  studentProgress: {
    loading: false,
    data: null
  },
adaptiveLearning: {
    recommendations: [],
    difficultyLevel: 'intermediate',
    lastUpdate: null,
    performanceHistory: [],
    learningInsights: {
      preferredLearningStyle: null,
      optimalDifficulty: 'intermediate',
      recommendedStudyTime: 30,
      adaptationTriggers: []
    }
  },
  videoPlayer: {
    currentVideoId: null,
    isPlaying: false,
    currentTime: 0,
    watchedPercentage: 0,
    fullscreen: false,
    volume: 1,
    playbackRate: 1,
    attribution: null,
    analytics: {
      startTime: null,
      totalWatchTime: 0,
      interactionCount: 0,
      seekEvents: []
    }
  }
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload
    },
    setCurrentModule: (state, action) => {
      state.currentModule = action.payload
    },
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.unshift({
        ...action.payload,
        id: Date.now(),
        read: false,
        createdAt: new Date().toISOString()
      })
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setAnalytics: (state, action) => {
      state.analytics.data = action.payload
      state.analytics.loading = false
      state.analytics.error = null
    },
    setAnalyticsLoading: (state, action) => {
      state.analytics.loading = action.payload
    },
    setAnalyticsError: (state, action) => {
      state.analytics.error = action.payload
      state.analytics.loading = false
    },
    updateCourseCreation: (state, action) => {
      state.courseCreation = { ...state.courseCreation, ...action.payload }
    },
    resetCourseCreation: (state) => {
      state.courseCreation = { step: 1, data: {}, loading: false }
    },
    setStudentProgress: (state, action) => {
      state.studentProgress.data = action.payload
      state.studentProgress.loading = false
    },
    setStudentProgressLoading: (state, action) => {
      state.studentProgress.loading = action.payload
    },
    updateAdaptiveLearning: (state, action) => {
      state.adaptiveLearning = { 
        ...state.adaptiveLearning, 
        ...action.payload,
        lastUpdate: new Date().toISOString()
      }
    },
    addAdaptiveRecommendation: (state, action) => {
      state.adaptiveLearning.recommendations.unshift(action.payload)
      // Keep only latest 5 recommendations
      if (state.adaptiveLearning.recommendations.length > 5) {
        state.adaptiveLearning.recommendations = state.adaptiveLearning.recommendations.slice(0, 5)
      }
    }
  },
})

export const { 
  setSelectedCourse, 
  setCurrentModule, 
  setCurrentLesson,
  addNotification, 
  markNotificationRead,
  markAllNotificationsRead,
  toggleSidebar,
  setAnalytics,
  setAnalyticsLoading,
  setAnalyticsError,
  updateCourseCreation,
  resetCourseCreation,
  setStudentProgress,
  setStudentProgressLoading,
  updateAdaptiveLearning,
  addAdaptiveRecommendation
} = dashboardSlice.actions
export default dashboardSlice.reducer