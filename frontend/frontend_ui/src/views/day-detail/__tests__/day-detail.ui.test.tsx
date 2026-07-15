import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { DayDetailUI } from '../day-detail.ui';
import type { IntentionRecord } from '@/types/intention';

const mockRecord: IntentionRecord = {
  id: 'b9e1d4c2-33a7-4f8b-bc2e-7a6f5e4d3c2b',
  userId: 'user-uuid-1234',
  date: '2026-07-14',
  text: 'Be present in every conversation.',
  rating: 'honoured',
  synced: true,
  createdAt: '2026-07-14T07:00:00.000Z',
  updatedAt: '2026-07-14T21:00:00.000Z',
};

describe('DayDetailUI', () => {
  it('renders the date heading', () => {
    render(
      <DayDetailUI
        date="2026-07-14"
        intentionRecord={mockRecord}
        isLoading={false}
        fetchError={null}
      />,
    );
    expect(screen.getByText(/July/i)).toBeInTheDocument();
  });

  it('renders the intention text', () => {
    render(
      <DayDetailUI
        date="2026-07-14"
        intentionRecord={mockRecord}
        isLoading={false}
        fetchError={null}
      />,
    );
    expect(screen.getByText('Be present in every conversation.')).toBeInTheDocument();
  });

  it('renders the rating badge when rating exists', () => {
    render(
      <DayDetailUI
        date="2026-07-14"
        intentionRecord={mockRecord}
        isLoading={false}
        fetchError={null}
      />,
    );
    expect(screen.getByText('Honoured')).toBeInTheDocument();
  });

  it('shows "No evening review recorded" when rating is null', () => {
    render(
      <DayDetailUI
        date="2026-07-14"
        intentionRecord={{ ...mockRecord, rating: null }}
        isLoading={false}
        fetchError={null}
      />,
    );
    expect(screen.getByText(/no evening review recorded/i)).toBeInTheDocument();
  });

  it('shows "No intention recorded" when record is null', () => {
    render(
      <DayDetailUI
        date="2026-07-14"
        intentionRecord={null}
        isLoading={false}
        fetchError={null}
      />,
    );
    expect(screen.getByText(/no intention recorded for this day/i)).toBeInTheDocument();
  });

  it('shows error message when fetchError is provided', () => {
    render(
      <DayDetailUI
        date="2026-07-14"
        intentionRecord={null}
        isLoading={false}
        fetchError="Couldn't load this day."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load this day.");
  });

  it('renders back link', () => {
    render(
      <DayDetailUI
        date="2026-07-14"
        intentionRecord={mockRecord}
        isLoading={false}
        fetchError={null}
      />,
    );
    expect(screen.getByLabelText('Back to Calendar')).toBeInTheDocument();
  });
});
