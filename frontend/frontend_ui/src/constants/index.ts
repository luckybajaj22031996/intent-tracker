export const INTENTION_MAX_CHARS = 140;

export const EVENING_MODE_HOUR = 17; // 5 PM

export const RATING_LABELS: Record<string, string> = {
  honoured: 'Honoured',
  partial: 'Partial',
  not_today: 'Not today',
};

export const RATING_DESCRIPTIONS: Record<string, string> = {
  honoured: 'You fully lived your intention today.',
  partial: 'You partially honoured your intention.',
  not_today: 'Today didn\'t go as intended — and that\'s okay.',
};

export const RATING_EMOJI: Record<string, string> = {
  honoured: '✨',
  partial: '🌤',
  not_today: '🌧',
};

export const AUTH_TOKEN_KEY = 'daydrop_auth_token';
export const REMINDER_PREF_KEY = 'daydrop_reminder_enabled';
export const ANON_USER_ID = 'anonymous';
