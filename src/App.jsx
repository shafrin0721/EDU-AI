import { Provider, useSelector } from "react-redux"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { store } from "./store"
import { useAuthPersistence } from "./hooks/useAuthPersistence"
import "react-toastify/dist/ReactToastify.css"

function AppContent() {
  const { mode: theme } = useSelector(state => state.theme)
  
  // Initialize Firebase auth persistence
  useAuthPersistence()
  
  return (
    <RouterProvider router={router} />
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
