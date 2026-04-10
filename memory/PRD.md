# Vocabulous - Spaced Learning App PRD

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Vite + Tailwind CSS (Ethereal Explorer design system)
- **Auth**: JWT tokens via localStorage + Authorization header
- **AI**: OpenAI GPT-4.1-mini via emergentintegrations (Emergent LLM Key)
- **SRS Algorithm**: FSRS-6 implementation

## What's Been Implemented

### Phase 1 - Full Redesign
- Complete port to Emergent platform (FastAPI + MongoDB + React)
- Ethereal Explorer design system (lavender/peach/mint, Plus Jakarta Sans, glassmorphism)
- Auth flows, Student & Teacher dashboards, Flashcard study with FSRS-6, Progress, Achievements

### Phase 2 - Features
- Card CRUD for teachers (deck detail page)
- Student enrollment via 6-character class codes
- Teacher student heatmap (30-day activity grid)
- Teacher bottleneck analysis (struggle cards, tag retention, class overdue)
- Research/practice mode for students
- Blurting exercise with coverage analysis

### Phase 3 - AI + Polish
- Login fix (withCredentials removed, localStorage + Authorization header)
- AI-powered learning persona (OpenAI GPT-4.1-mini)
- Dark mode with CSS class toggling
- Settings page (profile, theme, password change)

### Phase 4 - AI Study Coach
- **Full conversational AI chat** powered by OpenAI GPT-4.1-mini
- **4 quick-action cards**: Explain a concept, Create a mnemonic, Quiz me, Study tips
- **Card-aware context**: "Ask Coach" button on study page passes current card data
- **Student-aware**: Coach knows the student's name, retention stats, and struggling cards
- **Conversation history**: Persistent multi-turn conversations, browsable history panel
- **Markdown rendering**: Bold, lists, headers, code in AI responses
- **Fallback**: Rule-based responses if OpenAI is unavailable
- 37 backend API endpoints, all passing (100%)

## Prioritized Backlog
### P1 - Teacher class detail page with per-student analytics
### P2 - Notifications/reminders for overdue cards, Leaderboard, Export/import decks
