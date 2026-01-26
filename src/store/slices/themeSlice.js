import { createSlice } from "@reduxjs/toolkit"

// Check system preference on initial load
const getInitialTheme = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return 'light'
  
  const savedTheme = localStorage.getItem('eduai_theme')
  if (savedTheme) {
    return savedTheme
  }
  
  // Auto-detect system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const initialState = {
  mode: getInitialTheme(),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload
      localStorage.setItem('eduai_theme', action.payload)
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('eduai_theme', state.mode)
    },
  },
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
