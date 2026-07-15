import { useLocation } from 'react-router-dom';
import { IntentionSavedUI } from './intention-saved-confirmation.ui';

interface LocationState {
  intentionText?: string;
}

export function IntentionSavedView() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const savedIntentionText = state?.intentionText ?? '';

  return <IntentionSavedUI savedIntentionText={savedIntentionText} />;
}
