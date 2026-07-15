import { Link } from 'react-router-dom';
import { Bell, BellOff, LogIn, LogOut, User } from '@/utils/icons';
import clsx from 'clsx';

interface SettingsUIProps {
  reminderEnabled: boolean;
  permissionStatus: NotificationPermission | null;
  permissionError: string | null;
  isSignedIn: boolean;
  userEmail: string | null;
  isTogglingReminder: boolean;
  onToggleReminder: () => void;
  onSignOut: () => void;
}

export function SettingsUI({
  reminderEnabled,
  permissionStatus,
  permissionError,
  isSignedIn,
  userEmail,
  isTogglingReminder,
  onToggleReminder,
  onSignOut,
}: SettingsUIProps) {
  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Notifications section */}
      <div className="card space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Notifications
        </h2>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {reminderEnabled ? (
              <Bell size={20} className="text-brand-400 shrink-0" aria-hidden />
            ) : (
              <BellOff size={20} className="text-white/30 shrink-0" aria-hidden />
            )}
            <div>
              <p className="text-sm font-medium text-white">Morning reminder</p>
              <p className="text-xs text-white/40 mt-0.5">
                {reminderEnabled
                  ? "You'll be reminded each morning."
                  : 'Get a daily nudge to set your intention.'}
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={reminderEnabled}
            aria-label="Toggle morning reminder"
            disabled={isTogglingReminder}
            onClick={onToggleReminder}
            className={clsx(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
              'transition-colors duration-200 ease-in-out focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              reminderEnabled ? 'bg-brand-500' : 'bg-white/20',
            )}
          >
            <span
              aria-hidden
              className={clsx(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg',
                'transform transition duration-200 ease-in-out',
                reminderEnabled ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </div>

        {/* Permission error */}
        {permissionError && (
          <p role="alert" className="text-xs text-yellow-400/80 bg-yellow-900/20 rounded-lg px-3 py-2">
            {permissionError}
          </p>
        )}

        {/* Permission denied hint */}
        {permissionStatus === 'denied' && !permissionError && (
          <p className="text-xs text-white/30">
            Notifications are blocked. Enable them in your browser settings.
          </p>
        )}
      </div>

      {/* Account section */}
      <div className="card space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Account
        </h2>

        <div className="flex items-center gap-3">
          <User size={20} className="text-white/40 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-medium text-white">
              {isSignedIn ? 'Signed in' : 'Signed in anonymously'}
            </p>
            {userEmail && (
              <p className="text-xs text-white/40 mt-0.5">{userEmail}</p>
            )}
          </div>
        </div>

        {isSignedIn ? (
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        ) : (
          <Link
            to="/sign-in"
            className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            <LogIn size={16} aria-hidden />
            Sign in to sync your data
          </Link>
        )}
      </div>
    </section>
  );
}
