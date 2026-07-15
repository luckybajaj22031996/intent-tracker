import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { REMINDER_PREF_KEY } from '@/constants';
import { SettingsUI } from './settings.ui';

export function SettingsView() {
  const { status, user, signOut } = useAuth();
  const isSignedIn = status === 'authenticated';

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isTogglingReminder, setIsTogglingReminder] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMINDER_PREF_KEY);
    if (saved === 'true') setReminderEnabled(true);

    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleToggleReminder = useCallback(async () => {
    if (reminderEnabled) {
      // Disable reminder
      setReminderEnabled(false);
      localStorage.setItem(REMINDER_PREF_KEY, 'false');
      setPermissionError(null);
      return;
    }

    // Enable reminder — request push permission
    if (!('Notification' in window)) {
      setPermissionError('Notifications are not supported in this browser.');
      return;
    }

    setIsTogglingReminder(true);
    setPermissionError(null);

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        setReminderEnabled(true);
        localStorage.setItem(REMINDER_PREF_KEY, 'true');
      } else {
        setReminderEnabled(false);
        localStorage.setItem(REMINDER_PREF_KEY, 'false');
        setPermissionError(
          permission === 'denied'
            ? 'Notification permission was not granted. Enable it in your browser settings.'
            : 'Notification permission was not granted.',
        );
      }
    } catch {
      setPermissionError('Could not request notification permission.');
    } finally {
      setIsTogglingReminder(false);
    }
  }, [reminderEnabled]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <SettingsUI
      reminderEnabled={reminderEnabled}
      permissionStatus={permissionStatus}
      permissionError={permissionError}
      isSignedIn={isSignedIn}
      userEmail={user?.email ?? null}
      isTogglingReminder={isTogglingReminder}
      onToggleReminder={() => void handleToggleReminder()}
      onSignOut={handleSignOut}
    />
  );
}
