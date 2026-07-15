import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';

// Views
import { MorningHomeView } from '@/views/morning-home';
import { EveningReviewView } from '@/views/evening-review';
import { IntentionSavedView } from '@/views/intention-saved-confirmation';
import { ReviewSavedView } from '@/views/review-saved-confirmation';
import { CalendarHistoryView } from '@/views/calendar-history';
import { DayDetailView } from '@/views/day-detail';
import { SignInView } from '@/views/sign-in';
import { MagicLinkSentView } from '@/views/magic-link-sent';
import { AuthCallbackView } from '@/views/auth-callback';
import { SettingsView } from '@/views/settings';

function ShellLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export const router = createBrowserRouter([
  // Routes with app shell nav
  {
    element: <ShellLayout><MorningHomeView /></ShellLayout>,
    path: '/',
  },
  {
    element: <ShellLayout><EveningReviewView /></ShellLayout>,
    path: '/evening-review',
  },
  {
    element: <ShellLayout><CalendarHistoryView /></ShellLayout>,
    path: '/history',
  },
  {
    element: <ShellLayout><DayDetailView /></ShellLayout>,
    path: '/history/:date',
  },
  {
    element: <ShellLayout><SettingsView /></ShellLayout>,
    path: '/settings',
  },
  // Routes without app shell nav (full-screen flows)
  {
    element: <IntentionSavedView />,
    path: '/intention-saved',
  },
  {
    element: <ReviewSavedView />,
    path: '/evening-review/saved',
  },
  {
    element: <SignInView />,
    path: '/sign-in',
  },
  {
    element: <MagicLinkSentView />,
    path: '/magic-link-sent',
  },
  {
    element: <AuthCallbackView />,
    path: '/auth/callback',
  },
]);
