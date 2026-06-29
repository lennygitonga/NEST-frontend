import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasToken = !!localStorage.getItem('access_token')

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute