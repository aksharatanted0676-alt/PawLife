# PawLife AI - Modern Pet Healthcare Platform

Production-style multi-pet healthcare app with JWT auth, pet CRUD, Gemini chatbot, reminders, and notification center.

## Features

- Multi-pet management (add/edit/delete, switch active pet)
- Pet profile fields: name, age, breed, weight, medical history, vaccination records, profile image URL
- Gemini AI chatbot with selected pet context
- Predefined prompts:
  - "My dog is not eating"
  - "Vaccination schedule"
  - "Symptoms checker"
- Notifications and reminders:
  - Vaccination
  - Vet appointments
  - Medication
  - Custom reminders
- In-app notification bell with unread badge
- Cron-based backend reminder scheduler
- Health history timeline
- Emergency vet contact shortcut
- Dark mode toggle
- Service worker scaffold for push notifications

## Tech Stack

- Frontend: Next.js (React) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT
- AI: Google Gemini API (secure backend route)
- Scheduler: node-cron

## Folder Structure

```text
Paw/
  frontend/
    app/
    lib/
    public/sw.js
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
```

## Setup

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

## Environment Variables

### backend/.env

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/pawlife_ai
API_KEY=replace_with_api_key
API_SECRET=replace_with_api_secret
JWT_SECRET=replace_with_long_secret
GEMINI_API_KEY=
CLIENT_ORIGIN=http://localhost:3000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/pets` (auth)
- `POST /api/pets` (auth)
- `PUT /api/pets/:id` (auth)
- `DELETE /api/pets/:id` (auth)
- `POST /api/chat` (auth) -> secure Gemini call
- `GET /api/reminders` (auth)
- `POST /api/reminders` (auth)
- `PATCH /api/reminders/:id/read` (auth)
- `GET /api/notifications` (auth)

### Example Gemini Request

`POST /api/chat`

```json
{
  "message": "My cat is vomiting",
  "petData": {
    "name": "Milo",
    "ageYears": 3,
    "breed": "Indian Shorthair",
    "medicalHistory": []
  }
}
```

## Notes

- API keys are never exposed to frontend.
- Use HTTPS in production.
- Add Firebase Cloud Messaging later if you want mobile/web push delivery beyond current in-app + SW scaffold.
