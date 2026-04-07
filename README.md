## Social Impact Project Management System

Modern full-stack SaaS dashboard for managing social impact projects, volunteers, events, and donations.

### Tech Stack

- Frontend: React + Tailwind CSS + Recharts + Framer Motion
- Backend: Node.js + Express + JWT
- Database: MongoDB Atlas + Mongoose

### Folder Structure

- `frontend/`
  - `src/components/`
  - `src/pages/`
  - `src/layouts/`
  - `src/context/`, `src/utils/`
- `backend/`
  - `controllers/`
  - `routes/`
  - `models/`
  - `middleware/`
  - `config/`

### Features Included

- Gradient + glassmorphism/neumorphism-style UI
- Login page with animated card and gradient background
- Dashboard with sidebar, topbar, KPI cards, charts, and recent activity
- Project management page with status badges, colorful tags, and action buttons
- Volunteer cards with avatars, assigned tasks, and contribution hours
- Event cards in a calendar-style grid
- Donation list, total amount card, and donations graph
- Reusable UI components and smooth hover transitions
- Responsive design for mobile and desktop
- Dark/light mode toggle
- Search/filter on list pages; basic alerts on success/error
- JWT + bcrypt auth: register (Admin / Volunteer / Donor), login, `localStorage` token, protected routes, logout
- Full API integration: dashboard summary, CRUD for projects (multer images + volunteer assign), volunteers, events, donations
- Role-based navigation and admin-only mutations where noted

### Setup Instructions

#### 1) Backend

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Run backend:

```bash
npm run dev
```

#### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` (optional) from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000
```

Open the Vite URL (usually [http://localhost:5173](http://localhost:5173)). Use **Register** to create a user, then explore the dashboard; connect MongoDB Atlas in `backend/.env` first.

### API Endpoints

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Protected (Bearer token): `GET /api/dashboard/summary`
- Protected CRUD (Bearer token required)
  - `GET/POST/PUT/DELETE /api/projects` (POST/PUT: `multipart/form-data` optional `image`; JSON field `assignedVolunteers` as array or stringified JSON)
  - `GET/POST/PUT/DELETE /api/volunteers` (body: `projectIds` array for assignment)
  - `GET/POST/PUT/DELETE /api/events`
  - `GET/POST/PUT/DELETE /api/donations` (`GET` returns `{ donations, total }`)

### Sample Payloads

Register:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Password@123"
}
```

Create project:

```json
{
  "title": "Rural Literacy Program",
  "description": "Improve literacy access in remote villages.",
  "status": "Ongoing",
  "tags": ["Education", "Community"]
}
```
