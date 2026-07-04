import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  const hasToken = !!localStorage.getItem('access_token')
  const storedUser = localStorage.getItem('nest_user')
  const role = user?.profile?.role || (storedUser ? JSON.parse(storedUser)?.profile?.role : null)

  if (!hasToken) return <Navigate to="/login" replace />

  if (role === 'AGENCY') return <Navigate to="/agency/dashboard" replace />
  if (role === 'LANDLORD') return <Navigate to="/landlord/dashboard" replace />
  if (role === 'NEST_ADMIN') return <Navigate to="/admin/dashboard" replace />

  return children
}

export default ProtectedRoute