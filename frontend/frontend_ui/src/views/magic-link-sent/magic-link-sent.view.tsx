import { useLocation } from 'react-router-dom';
import { MagicLinkSentUI } from './magic-link-sent.ui';

interface LocationState {
  email?: string;
}

export function MagicLinkSentView() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  return <MagicLinkSentUI email={state?.email} />;
}
