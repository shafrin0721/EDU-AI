import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: {
    id: "usr_001",
    name: "Alex Chen",
    email: "alex.chen@university.edu",
    role: "student",
    organizationId: "org_001",
    avatar: "/api/placeholder/40/40"
  },
  organization: {
    id: "org_001",
    name: "Global University",
    domain: "university.edu"
  },
  isAuthenticated: true,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setOrganization: (state, action) => {
      state.organization = action.payload
    },
    logout: (state) => {
      state.user = null
      state.organization = null
      state.isAuthenticated = false
    },
    switchRole: (state, action) => {
      state.user.role = action.payload
    }
  },
})

export const { setUser, setOrganization, logout, switchRole } = authSlice.actions
export default authSlice.reducer