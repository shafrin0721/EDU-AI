import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import dashboardSlice from "./slices/dashboardSlice"
import themeSlice from "./slices/themeSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    theme: themeSlice,
  },
})