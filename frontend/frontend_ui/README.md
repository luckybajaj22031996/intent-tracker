# DayDrop — Frontend UI

A mobile-first Progressive Web App for setting one daily intention each morning and reflecting on it each evening.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite 6
- **Routing**: React Router v7
- **Data fetching**: TanStack Query v5
- **HTTP client**: Axios
- **Styling**: Tailwind CSS v3
- **Validation**: Zod
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa (Workbox)
- **Testing**: Vitest + Testing Library

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_INTENTION_STORE_URL` | Base URL for the Intention Store service (default: `http://localhost:8080`) |
| `VITE_SYNC_SERVICE_URL` | Base URL for the Sync Service (default: `http://localhost:8081`) |
| `VITE_SUPABASE_URL` | Supabase project URL (for auth) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

## Routes

| Route | Screen | Description |
|---|---|---|
| `/` | Morning Home | Set today's intention |
| `/evening-review` | Evening Review | Rate today's intention |
| `/intention-saved` | Intention Saved | Confirmation after saving intention |
| `/evening-review/saved` | Review Saved | Confirmation after saving rating |
| `/history` | Calendar History | Browse past intentions |
| `/history/:date` | Day Detail | View a specific day's intention and rating |
| `/sign-in` | Sign In | Magic link authentication |
| `/magic-link-sent` | Magic Link Sent | Confirmation after requesting magic link |
| `/auth/callback` | Auth Callback | Process magic link token + sync |
| `/settings` | Settings | Notifications and account management |

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type check
npm run test         # Run tests
npm run test:coverage # Run tests with coverage
```

## PWA

The app is installable as a PWA on mobile devices. The service worker is registered automatically and caches assets for offline use. Intentions are stored in IndexedDB locally and synced to Supabase when online.

## Architecture

```
src/
├── lib/          # API clients, query client
├── types/        # Zod schemas + TypeScript types
├── services/     # Async API calls
├── hooks/        # TanStack Query hooks
├── contexts/     # Auth + Toast providers
├── components/   # Shared dumb components
├── views/        # Screen-level smart + UI components
├── utils/        # Pure utility functions
└── constants/    # App-wide constants
```

## Anonymous Mode

The app works without an account. Intentions are stored locally in IndexedDB. Sign in to sync data to the cloud.
