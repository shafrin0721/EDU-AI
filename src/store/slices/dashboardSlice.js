import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  selectedCourse: null,
  currentModule: null,
  notifications: [],
  sidebarCollapsed: false,
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
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
  },
})

export const { 
  setSelectedCourse, 
  setCurrentModule, 
  addNotification, 
  markNotificationRead,
  toggleSidebar 
} = dashboardSlice.actions
export default dashboardSlice.reducer