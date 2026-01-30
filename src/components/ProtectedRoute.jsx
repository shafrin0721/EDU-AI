import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loading from '@/components/ui/Loading'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth)

  if (loading) {
    return <Loading />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
