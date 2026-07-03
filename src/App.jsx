import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Terms from './pages/Terms'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import Applications from './pages/Applications'
import Lease from './pages/Lease'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import TenantLayout from './layouts/TenantLayout'
import AgencyLayout from './layouts/AgencyLayout'
import AgencyProtectedRoute from './components/AgencyProtectedRoute'
import AgencyDashboard from './pages/agency/AgencyDashboard'
import AgencyProperties from './pages/agency/AgencyProperties'
import AgencyPropertyDetail from './pages/agency/AgencyPropertyDetail'
import AgencyApplications from './pages/agency/AgencyApplications'
import AgencyLeases from './pages/agency/AgencyLeases'
import AgencyTickets from './pages/agency/AgencyTickets'
import AgencyPayments from './pages/agency/AgencyPayments'
import AgencyTenants from './pages/agency/AgencyTenants'
import AgencyLandlords from './pages/agency/AgencyLandlords'
import AgencyProfile from './pages/agency/AgencyProfile'
import LandlordLayout from './layouts/LandlordLayout'
import LandlordProtectedRoute from './components/LandlordProtectedRoute'
import LandlordDashboard from './pages/landlord/LandlordDashboard'
import LandlordProperties from './pages/landlord/LandlordProperties'
import LandlordLeases from './pages/landlord/LandlordLeases'
import LandlordTickets from './pages/landlord/LandlordTickets'
import LandlordPayments from './pages/landlord/LandlordPayments'
import LandlordProfile from './pages/landlord/LandlordProfile'
import AdminLayout from './layouts/AdminLayout'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAgencies from './pages/admin/AdminAgencies'
import AdminUsers from './pages/admin/AdminUsers'
import AdminModeration from './pages/admin/AdminModeration'
import AdminPayments from './pages/admin/AdminPayments'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Tenant */}
        <Route
          element={
            <ProtectedRoute>
              <TenantLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/lease" element={<Lease />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Agency */}
        <Route
          element={
            <AgencyProtectedRoute>
              <AgencyLayout />
            </AgencyProtectedRoute>
          }
        >
          <Route path="/agency/dashboard" element={<AgencyDashboard />} />
          <Route path="/agency/properties" element={<AgencyProperties />} />
          <Route path="/agency/properties/:id" element={<AgencyPropertyDetail />} />
          <Route path="/agency/applications" element={<AgencyApplications />} />
          <Route path="/agency/leases" element={<AgencyLeases />} />
          <Route path="/agency/tickets" element={<AgencyTickets />} />
          <Route path="/agency/payments" element={<AgencyPayments />} />
          <Route path="/agency/tenants" element={<AgencyTenants />} />
          <Route path="/agency/landlords" element={<AgencyLandlords />} />
          <Route path="/agency/profile" element={<AgencyProfile />} />
        </Route>

        {/* Landlord */}
        <Route
          element={
            <LandlordProtectedRoute>
              <LandlordLayout />
            </LandlordProtectedRoute>
          }
        >
          <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
          <Route path="/landlord/properties" element={<LandlordProperties />} />
          <Route path="/landlord/leases" element={<LandlordLeases />} />
          <Route path="/landlord/tickets" element={<LandlordTickets />} />
          <Route path="/landlord/payments" element={<LandlordPayments />} />
          <Route path="/landlord/profile" element={<LandlordProfile />} />
        </Route>

        {/* NEST Admin */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/agencies" element={<AdminAgencies />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App