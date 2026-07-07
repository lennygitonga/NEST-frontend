# NEST Frontend — Property Management Platform

The React frontend for NEST, a multi-tenant SaaS real estate property management platform. Built with Vite, Zustand, Tailwind CSS v4, and Framer Motion. Four distinct role-based interfaces share a single unified application with role-aware routing.

**Backend Repository:** [https://github.com/lennygitonga/NEST](https://github.com/lennygitonga/NEST)  
**Live Backend API:** [https://web-production-6bf6f.up.railway.app](https://web-production-6bf6f.up.railway.app)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [User Roles and Routes](#user-roles-and-routes)
- [Key Features](#key-features)
- [Design System](#design-system)
- [Animations](#animations)
- [Authentication Flow](#authentication-flow)
- [State Management](#state-management)

---

## Overview

NEST frontend is a single-page React application that serves four completely different user experiences from one codebase:

- **Tenants** — browse properties, apply, track leases, pay rent, raise maintenance tickets
- **Agencies** — manage properties, review applications, create leases, handle tickets and invoices
- **Landlords** — read-only portfolio view of their properties, leases, tickets, and payments
- **NEST Admins** — platform-wide moderation, agency verification, user management, audit logs

Each role has its own protected layout with a distinct navigation set. Role-based redirects after login send users to the correct dashboard automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (JSX) |
| State Management | Zustand with localStorage persistence |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Routing | React Router v6 |
| HTTP Client | Axios with JWT refresh interceptor |
| Charts | Recharts |
| Google OAuth | @react-oauth/google |
| QR Code | qrcode.react (for 2FA setup) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- The NEST backend running locally or accessible via URL

### Installation

```bash
# Clone the repository
git clone https://github.com/lennygitonga/NEST-frontend.git
cd NEST-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Running with the Backend

Make sure the NEST Django backend is running at `http://localhost:8000` before using the frontend locally. See the [backend repository](https://github.com/lennygitonga/NEST) for setup instructions.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

For production, update `VITE_API_URL` to point to the live backend:

```env
VITE_API_URL=https://web-production-6bf6f.up.railway.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Project Structure

```
src/
├── api/
│   └── client.js              # Axios instance with JWT refresh interceptor
├── components/
│   ├── PageTransition.jsx     # Shared fade-up animation wrapper
│   ├── ProtectedRoute.jsx     # Tenant route guard
│   ├── AgencyProtectedRoute.jsx
│   ├── LandlordProtectedRoute.jsx
│   └── AdminProtectedRoute.jsx
├── hooks/                     # Custom React hooks (in progress)
├── layouts/
│   ├── TenantLayout.jsx       # Top nav + Outlet for Tenant pages
│   ├── AgencyLayout.jsx
│   ├── LandlordLayout.jsx
│   └── AdminLayout.jsx        # Dark charcoal nav for Admin
├── pages/
│   ├── Home.jsx               # Public landing page
│   ├── Login.jsx              # Email/password + Google sign-in
│   ├── Register.jsx           # Role picker (Tenant/Landlord/Agency)
│   ├── Terms.jsx              # Terms and Conditions (fetched from backend)
│   ├── VerifyEmail.jsx        # 6-digit email verification
│   ├── Dashboard.jsx          # Tenant dashboard
│   ├── Properties.jsx         # Property browse with filters
│   ├── PropertyDetail.jsx     # Property detail + apply
│   ├── Applications.jsx       # Tenant applications tracker
│   ├── Lease.jsx              # Active lease + AI summary
│   ├── Tickets.jsx            # Maintenance tickets list + create
│   ├── TicketDetail.jsx       # Ticket detail + comments
│   ├── Payments.jsx           # Rent payments + receipts + invoices
│   ├── Profile.jsx            # Settings: profile, password, 2FA, notifications, deletion
│   ├── agency/
│   │   ├── AgencyDashboard.jsx
│   │   ├── AgencyProperties.jsx
│   │   ├── AgencyPropertyDetail.jsx
│   │   ├── AgencyApplications.jsx
│   │   ├── AgencyLeases.jsx
│   │   ├── AgencyTickets.jsx
│   │   ├── AgencyPayments.jsx
│   │   ├── AgencyTenants.jsx
│   │   ├── AgencyLandlords.jsx
│   │   └── AgencyProfile.jsx
│   ├── landlord/
│   │   ├── LandlordDashboard.jsx
│   │   ├── LandlordProperties.jsx
│   │   ├── LandlordLeases.jsx
│   │   ├── LandlordTickets.jsx
│   │   ├── LandlordPayments.jsx
│   │   └── LandlordProfile.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AdminAgencies.jsx
│       ├── AdminUsers.jsx
│       ├── AdminModeration.jsx
│       └── AdminPayments.jsx
├── store/
│   └── authStore.js           # Zustand auth store
└── utils/
    ├── animations.js          # Shared Framer Motion variants
    └── downloadFile.js        # Authenticated PDF download helper
```

---

## User Roles and Routes

### Public Routes

| Route | Page |
|---|---|
| `/` | Home / Landing page |
| `/login` | Login |
| `/register` | Register (role picker) |
| `/terms` | Terms and Conditions |
| `/verify-email` | Email verification |

### Tenant Routes (protected — requires TENANT role)

| Route | Page |
|---|---|
| `/dashboard` | Tenant dashboard with live stats |
| `/properties` | Browse available properties |
| `/properties/:id` | Property detail + apply |
| `/applications` | Track application status |
| `/lease` | Active lease + AI plain-English summary |
| `/tickets` | Maintenance tickets |
| `/tickets/:id` | Ticket detail + comments |
| `/payments` | Rent payments, receipts, invoices |
| `/profile` | Settings (profile, password, 2FA, notifications, account deletion) |

### Agency Routes (protected — requires AGENCY role)

| Route | Page |
|---|---|
| `/agency/dashboard` | Agency dashboard with stats + AI insight |
| `/agency/properties` | Property listings — create, publish, unpublish, delete |
| `/agency/properties/:id` | Edit property details |
| `/agency/applications` | Review and approve/reject tenant applications |
| `/agency/leases` | Create and manage leases |
| `/agency/tickets` | Manage maintenance tickets + update status + comment |
| `/agency/payments` | Payments + create invoices + AI analytics |
| `/agency/tenants` | Active tenants with credit scores |
| `/agency/landlords` | Linked landlords — add by email lookup |
| `/agency/profile` | Agency settings |

### Landlord Routes (protected — requires LANDLORD role)

| Route | Page |
|---|---|
| `/landlord/dashboard` | Portfolio overview with AI insight |
| `/landlord/properties` | View properties listed under their name |
| `/landlord/leases` | Active and past leases |
| `/landlord/tickets` | Maintenance tickets on their properties |
| `/landlord/payments` | Rent payments on their properties |
| `/landlord/profile` | Settings |

### NEST Admin Routes (protected — requires NEST_ADMIN role)

| Route | Page |
|---|---|
| `/admin/dashboard` | Platform overview + pending alerts |
| `/admin/agencies` | Verify, suspend, penalize agencies |
| `/admin/users` | Search, ban, warn, delete users |
| `/admin/moderation` | Ban appeals, fraud reports, audit log |
| `/admin/payments` | Platform-wide payments + monthly reports |

---

## Key Features

### Role-Based Routing

After login, the app reads `user.profile.role` from the API response and redirects to the appropriate dashboard:

```
TENANT     → /dashboard
AGENCY     → /agency/dashboard
LANDLORD   → /landlord/dashboard
NEST_ADMIN → /admin/dashboard
```

Each protected route also enforces role at the guard level — an Agency user navigating to `/dashboard` is redirected to `/agency/dashboard` automatically.

### Automatic JWT Token Refresh

The Axios client (`src/api/client.js`) includes a response interceptor that:

1. Catches `401 Unauthorized` responses
2. Calls `POST /api/auth/token/refresh/` with the stored refresh token
3. Retries the original request with the new access token
4. Queues concurrent requests during refresh to avoid multiple refresh calls
5. Redirects to `/login` if the refresh token is also expired

### Google Sign-In

Google OAuth is implemented using `@react-oauth/google`. The frontend sends the Google ID token to `POST /api/auth/google-login/` on the backend, which verifies it, creates or finds the user, and returns a standard JWT pair. Google users are automatically email-verified and skip the verification step.

Google sign-in is intentionally hidden on the Register page when Agency is selected — Agency registration requires extra fields (name, registration number, address, phone) that cannot be provided via Google.

### Authenticated PDF Downloads

Payment receipts and invoices are generated as PDFs by the backend. Since the download endpoints require authentication, a plain `<a href>` link won't work. The `downloadFile` utility (`src/utils/downloadFile.js`) fetches the PDF via Axios (which sends the Authorization header), converts the response to a blob, and triggers a browser download.

### AI-Powered Features

All AI features call backend endpoints that use Groq under the hood — the frontend simply displays the returned text:

- **Lease summary** — "Explain this lease in plain English" button on the Tenant lease page
- **Ticket priority** — automatically set by the backend when a ticket is created; shown as a badge
- **Payment analytics** — AI insight shown on Agency, Landlord, and Admin dashboards
- **Invoice AI summary** — shown on invoice cards for tenants and agencies

---

## Design System

### Color Palette — Clay and Sand

```css
--color-clay:     #8C5E58   /* Muted reddish-brown — primary accent */
--color-sienna:   #C97B5E   /* Warm sienna — buttons, links */
--color-charcoal: #221F1C   /* Near-black — text, dark surfaces */
--color-sand:     #EFE6D8   /* Warm off-white — backgrounds */
--color-olive:    #7A8B5E   /* Muted green — success states */
--color-brick:    #9E4337   /* Deep red — errors, destructive actions */
```

Registered in `src/index.css` via Tailwind v4's `@theme` block. Usable as utility classes: `bg-clay`, `text-sienna`, `border-brick/20`, etc.

### Typography

- **Display / Headings** — Fraunces (Google Fonts, serif) — used for page titles, card headings, the NEST wordmark
- **Body / UI** — Inter (Google Fonts, sans-serif) — used for all body text, labels, buttons, nav items

Both are loaded via a `<link>` in `index.html`.

### Admin Layout

The NEST Admin panel uses a dark charcoal (`#221F1C`) top navigation bar instead of the sand background used by other roles — a deliberate visual distinction that makes it immediately clear you're in an elevated-privilege context.

---

## Animations

Built with Framer Motion. All animation values are centralized in `src/utils/animations.js` for consistency.

### Animation Principles

- Duration: 150ms–300ms maximum — nothing feels sluggish
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — fast start, smooth stop
- Only `opacity` and `transform` are animated — no layout properties that cause reflow

### What's Animated

| Element | Animation |
|---|---|
| Auth page brand panel | Fade in on mount |
| Auth page form | Slide up with slight delay after brand panel |
| Agency fields on Register | Height expand/collapse when switching roles |
| Error messages | Fade and slide in, animate out on dismiss |
| Page content (route changes) | Fade up via `PageTransition` wrapper in each layout |
| Stat cards (dashboards) | Fade up + hover lift |
| Property cards | Hover lift with shadow |
| Dropdown menus | Scale in from top-right with `AnimatePresence` |
| Home page hero | Fade and slide up on load |

---

## Authentication Flow

```
Register
  └─ POST /api/auth/register/
  └─ Redirect → /verify-email
       └─ POST /api/auth/verify-email/
       └─ Redirect → /{role}/dashboard

Login (email/password)
  └─ POST /api/auth/login/
  ├─ 2FA required → /verify-2fa
  └─ Success → /{role}/dashboard

Login (Google)
  └─ Google ID token → POST /api/auth/google-login/
  └─ Redirect → /{role}/dashboard (auto-verified, skip email step)

Token Refresh (automatic)
  └─ 401 response → POST /api/auth/token/refresh/
  └─ Retry original request
  └─ Failure → /login
```

---

## Backend

The Django REST Framework backend provides all data, authentication, and business logic.

- **Repository:** [https://github.com/lennygitonga/NEST](https://github.com/lennygitonga/NEST)
- **Live API:** [https://web-production-6bf6f.up.railway.app](https://web-production-6bf6f.up.railway.app)
- **API Docs:** [https://web-production-6bf6f.up.railway.app/api/docs/](https://web-production-6bf6f.up.railway.app/api/docs/)

The backend exposes 79 endpoints across 8 apps covering authentication, agencies, properties, tickets, payments, notifications, terms, and moderation.

---

## Author

**Lenny Gitonga**