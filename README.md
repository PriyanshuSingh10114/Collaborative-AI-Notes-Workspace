# Collaborative AI Notes Workspace

A modern, production-ready SaaS application for collaborative AI-powered note-taking. Built for a Full Stack Developer Internship evaluation.

## Features

- **Authentication & Security:** Secure JWT-based authentication with password hashing (bcrypt), HTTP-only cookies/headers, rate limiting, and Helmet.
- **Notes Management:** Create, edit, delete, archive, pin, and favorite notes with rich text (TipTap).
- **AI Integration (Google Gemini / OpenAI):**
  - Generate concise summaries from long notes.
  - Extract actionable tasks from notes.
  - Generate smart titles based on content.
  - Suggest relevant tags.
- **Productivity Analytics:** Visual dashboard showing notes stats, active categories, and activity over time using Recharts.
- **Public Sharing:** Share individual notes via unique, read-only public links.
- **Advanced UI/UX:** Responsive SaaS design with Tailwind CSS, Framer Motion animations, Shadcn UI components, dark-mode compatibility, and auto-save debouncing.

## Tech Stack

### Frontend
- **React.js (Vite)**
- **Tailwind CSS & Framer Motion**
- **Zustand** (Global State Management)
- **React Query** (Data Fetching)
- **Shadcn UI & Lucide Icons** (UI Components)
- **React Router DOM** (Routing)
- **React Hook Form & Zod** (Form Validation)
- **TipTap** (Rich Text Editor)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **JWT (JSON Web Tokens)**
- **Google GenAI / OpenAI SDK**

## Project Architecture

```text
├── frontend/        # React SPA
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks (useAuth, useDebounce)
│   │   ├── pages/       # Route-level components
│   │   ├── store/       # Zustand global stores
│   │   ├── services/    # API calls & Axios config
│   │   └── utils/       # Utility functions
├── backend/         # Express API
│   ├── src/
│   │   ├── controllers/ # Route logic
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # Express routers
│   │   ├── middleware/  # Auth & error handling
│   │   ├── services/    # Business logic (AI, etc)
│   │   └── utils/       # Helper functions
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Gemini API Key (or OpenAI API Key)

### 1. Clone the repository
```bash
git clone https://github.com/PriyanshuSingh10114/Collaborative-AI-Notes-Workspace.git
cd Collaborative-AI-Notes-Workspace
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

## API Documentation

- **Auth:** `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- **Notes:** CRUD operations at `/api/notes`, toggles at `/api/notes/:id/archive`, `/api/notes/:id/pin`, `/api/notes/:id/favorite`
- **AI:** `/api/ai/summarize`, `/api/ai/action-items`, `/api/ai/suggest-title`, `/api/ai/suggest-tags`
- **Sharing:** `POST /api/share/:noteId`, `GET /api/share/:shareId`
- **Analytics:** `/api/analytics/dashboard`

## Testing (Development)
- **Frontend:** Implemented using React Testing Library/Vitest (optional extension)
- **Backend:** Setup for Jest / Supertest.

## Deployment Guide
- **Frontend:** Deploy on Vercel by pointing to the `frontend` directory and setting the build command to `npm run build`.
- **Backend:** Deploy on Render or Railway, pointing to the `backend` directory. Ensure Environment Variables are configured.
- **Database:** Host on MongoDB Atlas and whitelist IP addresses.
