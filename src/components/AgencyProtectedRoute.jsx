import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function AgencyProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  const hasToken = !!localStorage.getItem('access_token')
  const storedUser = localStorage.getItem('nest_user')
  const role = user?.profile?.role || (storedUser ? JSON.parse(storedUser)?.profile?.role : null)

  if (!hasToken) return <Navigate to="/login" replace />
  if (role && role !== 'AGENCY') return <Navigate to="/dashboard" replace />

  return children
}

export default AgencyProtectedRoute