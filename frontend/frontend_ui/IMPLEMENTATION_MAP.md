# Implementation Map

## Screen → Route → Components → Services → State

### morning-home → `/`
- **View**: `src/views/morning-home/morning-home.view.tsx`
- **UI**: `src/views/morning-home/morning-home.ui.tsx`
- **Hooks**: `useTodaysIntention`, `usePreviousIntention`, `useSaveIntention`
- **Services**: `intentions.getTodaysIntention`, `intentions.getPreviousIntention`, `intentions.saveIntention`
- **State**: `intentionText`, `serverError` (local); `todaysIntention`, `previousIntention` (TanStack Query)
- **Navigation**: success → `/intention-saved` with `{ intentionText, id }` state
- **Verification**: `npm run typecheck && npm run build`

### evening-review → `/evening-review`
- **View**: `src/views/evening-review/evening-review.view.tsx`
- **UI**: `src/views/evening-review/evening-review.ui.tsx`
- **Hooks**: `useTodaysIntention`, `useSaveEveningRating`
- **Services**: `intentions.getTodaysIntention`, `intentions.saveEveningRating`
- **State**: `selectedRating`, `saveError` (local); `todaysIntention` (TanStack Query)
- **Navigation**: success → `/evening-review/saved` with `{ rating, savedAt }` state

### intention-saved-confirmation → `/intention-saved`
- **View**: `src/views/intention-saved-confirmation/intention-saved-confirmation.view.tsx`
- **UI**: `src/views/intention-saved-confirmation/intention-saved-confirmation.ui.tsx`
- **Hooks**: none
- **Services**: none
- **State**: `savedIntentionText` from navigation state
- **Navigation**: "View History" → `/history`

### review-saved-confirmation → `/evening-review/saved`
- **View**: `src/views/review-saved-confirmation/review-saved-confirmation.view.tsx`
- **UI**: `src/views/review-saved-confirmation/review-saved-confirmation.ui.tsx`
- **Hooks**: none
- **Services**: none
- **State**: `ratingValue`, `savedAt` from navigation state
- **Navigation**: "View History" → `/history`

### calendar-history → `/history`
- **View**: `src/views/calendar-history/calendar-history.view.tsx`
- **UI**: `src/views/calendar-history/calendar-history.ui.tsx`
- **Hooks**: `useListIntentions`
- **Services**: `intentions.listIntentions`
- **State**: `displayedMonth` (local); `intentions` (TanStack Query)
- **Navigation**: day tap → `/history/:date` with `{ record }` state

### day-detail → `/history/:date`
- **View**: `src/views/day-detail/day-detail.view.tsx`
- **UI**: `src/views/day-detail/day-detail.ui.tsx`
- **Hooks**: none (direct service call for deep-link)
- **Services**: `intentions.getTodaysIntention` (deep-link only)
- **State**: `intentionRecord`, `isLoading`, `fetchError` (local)
- **Navigation**: back → `/history`

### sign-in → `/sign-in`
- **View**: `src/views/sign-in/sign-in.view.tsx`
- **UI**: `src/views/sign-in/sign-in.ui.tsx`
- **Hooks**: none
- **Services**: STUB — `POST /auth/v1/magiclink` not in openapi-specs
- **State**: `email`, `isSubmitting`, `clientError`, `serverError` (local)
- **Navigation**: success → `/magic-link-sent`; "Continue without account" → `/`

### magic-link-sent → `/magic-link-sent`
- **View**: `src/views/magic-link-sent/magic-link-sent.view.tsx`
- **UI**: `src/views/magic-link-sent/magic-link-sent.ui.tsx`
- **Hooks**: none
- **Services**: none
- **State**: `email` from navigation state
- **Navigation**: "Try again" → `/sign-in`

### auth-callback → `/auth/callback`
- **View**: `src/views/auth-callback/auth-callback.view.tsx`
- **UI**: `src/views/auth-callback/auth-callback.ui.tsx`
- **Hooks**: `useTriggerSync` (via direct service call)
- **Services**: `sync.triggerSync` (real); `GET /auth/v1/verify` (STUB)
- **State**: `verifyStatus`, `errorMessage` (local)
- **Navigation**: success → `/`; error → `/sign-in`

### settings → `/settings`
- **View**: `src/views/settings/settings.view.tsx`
- **UI**: `src/views/settings/settings.ui.tsx`
- **Hooks**: none
- **Services**: none (browser Push API + localStorage)
- **State**: `reminderEnabled`, `permissionStatus`, `permissionError`, `isTogglingReminder` (local)
- **Navigation**: "Sign in" → `/sign-in`

## Verification Commands

```bash
cd frontend_ui
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```
