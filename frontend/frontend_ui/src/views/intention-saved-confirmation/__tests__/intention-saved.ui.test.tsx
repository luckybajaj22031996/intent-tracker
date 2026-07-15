import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { IntentionSavedUI } from '../intention-saved-confirmation.ui';

describe('IntentionSavedUI', () => {
  it('renders the confirmation heading', () => {
    render(<IntentionSavedUI savedIntentionText="Focus on deep work." />);
    expect(screen.getByText('Intention set')).toBeInTheDocument();
  });

  it('renders the saved intention text', () => {
    render(<IntentionSavedUI savedIntentionText="Focus on deep work." />);
    expect(screen.getByText('Focus on deep work.')).toBeInTheDocument();
  });

  it('renders placeholder when no text provided', () => {
    render(<IntentionSavedUI savedIntentionText="" />);
    expect(screen.getByText(/your intention has been saved/i)).toBeInTheDocument();
  });

  it('renders View History link', () => {
    render(<IntentionSavedUI savedIntentionText="Test" />);
    expect(screen.getByText('View History')).toBeInTheDocument();
  });
});
