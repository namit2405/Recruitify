# Recruitify

A comprehensive recruitment platform with candidate management, job postings, and real-time chat functionality.

## Features

- User authentication with MFA and email verification
- Candidate and organization profiles
- Job vacancy management
- Resume parsing and scoring
- Real-time chat with file sharing
- Follow system for candidates and organizations

## Tech Stack

- Backend: Django, Django Channels (WebSocket)
- Frontend: React
- Database: SQLite (development)

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Configure the required environment variables in `.env` files for both backend and frontend.
