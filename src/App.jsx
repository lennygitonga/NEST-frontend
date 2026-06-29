import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Terms from './pages/Terms'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import Applications from './pages/Applications'
import Lease from './pages/Lease'
import Tickets from './pages/Tickets'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import TenantLayout from './layouts/TenantLayout'
import PropertyDetail from './pages/PropertyDetail'
import TicketDetail from './pages/TicketDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route
          element={
            <ProtectedRoute>
              <TenantLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/lease" element={<Lease />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App