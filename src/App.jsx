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
import AgencyLayout from './layouts/AgencyLayout'
import AgencyProtectedRoute from './components/AgencyProtectedRoute'
import AgencyDashboard from './pages/agency/AgencyDashboard'
import AgencyProperties from './pages/agency/AgencyProperties'
import AgencyApplications from './pages/agency/AgencyApplications'
import AgencyLeases from './pages/agency/AgencyLeases'
import AgencyTickets from './pages/agency/AgencyTickets'
import AgencyPayments from './pages/agency/AgencyPayments'
import AgencyTenants from './pages/agency/AgencyTenants'
import AgencyLandlords from './pages/agency/AgencyLandlords'
import LandlordLayout from './layouts/LandlordLayout'
import LandlordProtectedRoute from './components/LandlordProtectedRoute'
import LandlordDashboard from './pages/landlord/LandlordDashboard'
import LandlordProperties from './pages/landlord/LandlordProperties'
import LandlordLeases from './pages/landlord/LandlordLeases'
import LandlordTickets from './pages/landlord/LandlordTickets'
import LandlordPayments from './pages/landlord/LandlordPayments'

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
        <Route
          element={
            <AgencyProtectedRoute>
              <AgencyLayout />
            </AgencyProtectedRoute>
          }
        >
          <Route path="/agency/dashboard" element={<AgencyDashboard />} />
          <Route path="/agency/properties" element={<AgencyProperties />} />
          <Route path="/agency/applications" element={<AgencyApplications />} />
          <Route path="/agency/leases" element={<AgencyLeases />} />
          <Route path="/agency/tickets" element={<AgencyTickets />} />
          <Route path="/agency/payments" element={<AgencyPayments />} />
          <Route path="/agency/tenants" element={<AgencyTenants />} />
          <Route path="/agency/landlords" element={<AgencyLandlords />} />
        </Route>
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App