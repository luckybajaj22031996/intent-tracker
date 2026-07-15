# Shared Inventory

## Components

| Component | Props | Used By | Notes |
|---|---|---|---|
| `AppShell` | `children: ReactNode` | All shell-wrapped routes | Header + bottom nav + main content wrapper |
| `Skeleton` | `className?, lines?` | morning-home, evening-review, day-detail | Animated loading placeholder |
| `CardSkeleton` | — | morning-home, evening-review, day-detail | Pre-composed card skeleton |
| `ErrorBanner` | `message, onRetry?` | morning-home, evening-review, calendar-history, day-detail | Inline error display with optional retry |
| `EmptyState` | `icon?, title, description?, action?` | calendar-history | Centred empty-state block |
| `RatingBadge` | `rating: Rating, size?` | day-detail, review-saved-confirmation | Coloured badge for honoured/partial/not_today |
| `SyncBanner` | `synced: boolean` | (available for use) | "Saved locally" offline indicator |
| `SyncedIndicator` | — | (available for use) | "Synced" cloud indicator |
| `PageHeader` | `title, showBack?, backTo?, backLabel?, action?` | (available for use) | Reusable page header with back button |

## Hooks

| Hook | Source API | Used By |
|---|---|---|
| `useTodaysIntention` | `GET /api/intentions/today` | morning-home, evening-review |
| `usePreviousIntention` | `GET /api/intentions/previous` | morning-home |
| `useSaveIntention` | `POST /api/intentions` | morning-home |
| `useSaveEveningRating` | `PATCH /api/intentions/rating` | evening-review |
| `useListIntentions` | `GET /api/intentions` | calendar-history |
| `useTriggerSync` | `POST /sync/trigger` | auth-callback (direct service call) |

## Layout

| Layout | Used By | Notes |
|---|---|---|
| `AppShell` | `/`, `/evening-review`, `/history`, `/history/:date`, `/settings` | Mobile-first shell with header + bottom nav |
| Full-screen (no shell) | `/intention-saved`, `/evening-review/saved`, `/sign-in`, `/magic-link-sent`, `/auth/callback` | Centred card layout, no nav |
