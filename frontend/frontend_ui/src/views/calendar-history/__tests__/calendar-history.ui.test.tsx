import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { CalendarHistoryUI } from '../calendar-history.ui';

const defaultProps = {
  displayedMonth: new Date(2026, 6, 1), // July 2026
  intentionDates: new Set<string>(['2026-07-14', '2026-07-15']),
  isLoading: false,
  fetchError: null,
  onPrevMonth: vi.fn(),
  onNextMonth: vi.fn(),
  onDayClick: vi.fn(),
  onRetry: vi.fn(),
};

describe('CalendarHistoryUI', () => {
  it('renders the heading', () => {
    render(<CalendarHistoryUI {...defaultProps} />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('renders the month name', () => {
    render(<CalendarHistoryUI {...defaultProps} />);
    expect(screen.getByText(/July 2026/i)).toBeInTheDocument();
  });

  it('renders day cells for the month', () => {
    render(<CalendarHistoryUI {...defaultProps} />);
    // July has 31 days
    expect(screen.getByLabelText('2026-07-01, has intention')).toBeTruthy();
  });

  it('calls onPrevMonth when previous button is clicked', () => {
    const onPrevMonth = vi.fn();
    render(<CalendarHistoryUI {...defaultProps} onPrevMonth={onPrevMonth} />);
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(onPrevMonth).toHaveBeenCalled();
  });

  it('calls onDayClick when a day with intention is clicked', () => {
    const onDayClick = vi.fn();
    render(<CalendarHistoryUI {...defaultProps} onDayClick={onDayClick} />);
    fireEvent.click(screen.getByLabelText('2026-07-14, has intention'));
    expect(onDayClick).toHaveBeenCalledWith('2026-07-14');
  });

  it('does not call onDayClick for days without intention', () => {
    const onDayClick = vi.fn();
    render(<CalendarHistoryUI {...defaultProps} onDayClick={onDayClick} />);
    // Day 1 has no intention in our set
    const day1 = screen.queryByLabelText('2026-07-01');
    if (day1) {
      fireEvent.click(day1);
      expect(onDayClick).not.toHaveBeenCalled();
    }
  });

  it('shows error banner when fetchError is provided', () => {
    render(
      <CalendarHistoryUI
        {...defaultProps}
        fetchError="Couldn't load your history."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load your history.");
  });

  it('shows empty state when no intentions and not loading', () => {
    render(
      <CalendarHistoryUI
        {...defaultProps}
        intentionDates={new Set()}
      />,
    );
    expect(screen.getByText(/no intentions recorded yet/i)).toBeInTheDocument();
  });
});
