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
- **Students**: Study flashcards with spaced repetition, track progress, earn achievements, practice freely, do blurting exercises
- **Teachers**: Create classes with join codes, manage decks of flashcards, add/edit/delete cards, view student heatmaps and bottleneck analysis

## Core Requirements
- Full redesign with "The Ethereal Explorer" design system (lavender/peach/mint palette)
- Science-backed spaced repetition with FSRS-6 algorithm
- Teacher & Student dashboards with analytics
- Flashcard study sessions with 4-grade review system
- Achievement system with badges
- Class & deck management with join-by-code enrollment
- Knowledge graph per student
- Learning persona insights
- Card CRUD for teachers
- Student heatmap for teachers
- Content bottleneck analysis for teachers
- Research/practice mode for students
- Blurting exercise for students

## What's Been Implemented

### Phase 1 (Jan 10, 2026)
- Complete backend port to FastAPI + MongoDB with all core APIs
- Full frontend redesign with Ethereal Explorer design system
- Auth flows (signup, login, logout) with JWT cookies
- Student Dashboard, Study, Progress, Achievements
- Teacher Dashboard, Classes management
- Landing page with glassmorphism, organic sections, pricing
- Seeded demo data

### Phase 2 (Jan 10, 2026)
- **Card Creation UI**: Teachers can add/edit/delete cards within deck detail page with inline forms
- **Student Enrollment Flow**: Join class by 6-character code, auto-generated codes on class creation, copy-to-clipboard class codes on teacher view
- **Teacher Student Heatmap**: 30-day color-coded activity grid per student, showing review count and retention per day
- **Teacher Bottleneck Analysis**: Lowest-recall cards, tag-level retention summary, overdue counts per class
- **Research/Practice Mode**: Browse all enrolled decks, practice any deck freely without saving progress, "Next Card" flow
- **Blurting Exercise**: Write-everything-you-know from memory, term-matching analysis showing coverage %, missed card highlights, session history
- **New Navigation**: Research & Blurting links for students, Heatmap & Bottlenecks links for teachers
- All tests passed (100% - 26 backend endpoints, all frontend flows)

## Prioritized Backlog
### P1 (High)
- AI-powered learning persona via OpenAI integration
- Teacher class detail page with student list and individual analytics
- Dark mode support

### P2 (Medium)
- Settings page (profile, password change)
- Mobile responsive improvements
- Email notifications for at-risk students
- Leaderboard

### P3 (Nice to Have)
- Building in Public / Pitch Deck pages
- Export/import deck functionality
- Social sharing for streaks
