## Monorepo: Shared Notes App

This is a simple full-stack monorepo with:

- **Backend** (`backend/`): Node.js + Express + MongoDB (Mongoose) API
- **Frontend** (`frontend/`): React + Vite single-page app

Users can **register/login with email + password**, **post notes**, and **search/read notes**. Notes are public to read/search; posting requires login.

---

### Project Structure

- **`backend/`**: API server
  - Auth (email + password, JWT in HTTP-only cookie)
  - Endpoints to create and list/search notes
  - Uses MongoDB with Mongoose
- **`frontend/`**: React UI
  - Login / Register form
  - Form to post a note (for logged-in users)
  - Search bar + list of notes

---

### Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** running locally or in the cloud (e.g. MongoDB Atlas)

---

### Environment Variables

Create a `.env` file in `backend/` with at least:

```bash
MONGO_URI=mongodb://localhost:27017/notes_app
JWT_SECRET=super_secret_change_me
PORT=4000
CLIENT_URL=http://localhost:5173
```

Adjust `MONGO_URI` and `CLIENT_URL` if needed.

---

### Install Dependencies

From the monorepo root:

```bash
npm install
npm install --workspace backend
npm install --workspace frontend
```

Or use the helper script:

```bash
npm run install:all
```

---

### Run in Development

From the root:

```bash
npm run dev
```

This will:

- Start **backend** on `http://localhost:4000`
- Start **frontend** (Vite dev server) on `http://localhost:5173`

The frontend is configured to proxy `/api/*` to the backend, so API calls are made relative to the frontend origin.

You can also run each side individually:

```bash
npm run dev:backend
npm run dev:frontend
```

---

### Backend Overview (`backend/`)

- **Main entry**: `src/index.js`
- **Auth routes**: `src/routes/auth.js`
  - `POST /api/auth/register` – register with `email`, `password`
  - `POST /api/auth/login` – login with `email`, `password`
  - `POST /api/auth/logout` – clear auth cookie
  - `GET /api/auth/me` – get current user from JWT cookie
- **Note routes**: `src/routes/notes.js`
  - `POST /api/notes` – create note (requires login)
  - `GET /api/notes?search=...` – list/search public notes
  - `GET /api/notes/:id` – get a single note by ID

Authentication uses a **JWT** stored in an **HTTP-only cookie**.

---

### Frontend Overview (`frontend/`)

- React app created with **Vite**
- Main components:
  - Auth panel (login/register toggle)
  - Note creation form (only visible when logged in)
  - Search input + notes list
- Calls the backend via:
  - `/api/auth/*` for auth
  - `/api/notes/*` for notes

---

### Scripts Summary

From the **root**:

- **`npm run dev`**: run backend & frontend together
- **`npm run dev:backend`**: run backend only
- **`npm run dev:frontend`**: run frontend only
- **`npm run install:all`**: install root + workspace dependencies

From **`backend/`**:

- **`npm run dev`**: start backend with nodemon
- **`npm start`**: start backend with node

From **`frontend/`**:

- **`npm run dev`**: Vite dev server
- **`npm run build`**: build production bundle
- **`npm run preview`**: preview built frontend

