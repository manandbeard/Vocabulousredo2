# Vocabulous - Spaced Learning App PRD

## Original Problem Statement
Redesign and improve the Spaced Learning app with full app redesign, code improvements, and new features.

## Architecture
- **Backend**: FastAPI + MongoDB (ported from Express.js + PostgreSQL)
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: JWT tokens via localStorage + Authorization header
- **AI**: OpenAI GPT-4.1-mini via emergentintegrations (Emergent LLM Key)
- **SRS Algorithm**: FSRS-6 implementation

## What's Been Implemented

### Phase 1 - Full Redesign (Jan 10, 2026)
- Complete port to Emergent platform (FastAPI + MongoDB + React)
- Ethereal Explorer design system (lavender/peach/mint palette)
- Auth (signup, login, logout), Student & Teacher dashboards
- Flashcard study with FSRS-6, Progress, Achievements

### Phase 2 - Features (Jan 10, 2026)
- Card CRUD for teachers (deck detail page)
- Student enrollment via class codes
- Teacher student heatmap (30-day activity grid)
- Teacher bottleneck analysis (struggle cards, tag retention)
- Research/practice mode for students
- Blurting exercise with coverage analysis

### Phase 3 - AI + Polish (Jan 10, 2026)
- **Login fix**: Removed withCredentials:true (CORS issue with proxy), switched to localStorage + Authorization header
- **AI-powered learning persona**: OpenAI GPT-4.1-mini generates personalized learning profiles with grit scores, flow states, and custom descriptions
- **Dark mode**: Full dark theme with CSS class toggling, theme toggle in nav bar
- **Settings page**: Profile editing, theme switching, password change
- **Mobile responsive**: CSS media queries for mobile layout

## Prioritized Backlog
### P1 (High)
- Teacher class detail page with student list and individual analytics
- Notifications/reminders for overdue cards

### P2 (Medium)
- Leaderboard
- Export/import decks
- Social sharing for streaks
