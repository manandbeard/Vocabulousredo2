# Vocabulous - Spaced Learning App PRD

## Original Problem Statement
Redesign and improve the Spaced Learning app. Identify where code can be improved and UI/UX can be made more user friendly and marketable.

## Architecture
- **Backend**: FastAPI + MongoDB (ported from Express.js + PostgreSQL)
- **Frontend**: React + Vite + Tailwind CSS (ported from monorepo setup)
- **Database**: MongoDB with auto-incrementing IDs
- **Auth**: JWT-based (httpOnly cookies)
- **SRS Algorithm**: FSRS-6 implementation

## User Personas
- **Students**: Use the app to study flashcards with spaced repetition, track progress, earn achievements
- **Teachers**: Create classes, manage decks of flashcards, view student analytics and retention data

## Core Requirements
- Full redesign with "The Ethereal Explorer" design system (lavender/peach/mint palette)
- Science-backed spaced repetition with FSRS-6 algorithm
- Teacher & Student dashboards with analytics
- Flashcard study sessions with 4-grade review system
- Achievement system with badges
- Class & deck management
- Knowledge graph per student
- Learning persona AI insights

## What's Been Implemented (Jan 10, 2026)
- Complete backend port to FastAPI + MongoDB with all core APIs
- Full frontend redesign with Ethereal Explorer design system
- Auth flows (signup, login, logout) with JWT cookies
- Student Dashboard with streak, retention, mastery, knowledge graph
- Student Study page with 3D flip card animations and FSRS grading
- Student Progress page with deck-level breakdowns
- Student Achievements page with earned/locked badges
- Teacher Dashboard with class analytics, engagement charts
- Teacher Classes management with create functionality
- Landing page with glassmorphism, organic sections, pricing
- Seeded demo data (teacher, student, 3 classes, 3 decks, 17 flashcards)
- All tests passed (100% backend, frontend, integration)

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (High)
- Card creation UI for teachers (deck detail page)
- Student enrollment flow
- Teacher student heatmap view
- Research/practice mode for students

### P2 (Medium)
- Blurting exercise feature
- Teacher bottleneck analysis page
- Settings page
- Dark mode support
- Mobile responsive improvements

### P3 (Nice to Have)
- AI-powered learning persona (OpenAI integration)
- Building in Public page
- Pitch Deck page
- Email notifications for teachers
- Leaderboard
