import { ChevronLeft, ChevronRight } from '@/utils/icons';
import { ErrorBanner } from '@/components/error-banner';
import { EmptyState } from '@/components/empty-state';
import { Calendar } from '@/utils/icons';
import {
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
} from '@/utils/format';
import clsx from 'clsx';

interface CalendarHistoryUIProps {
  displayedMonth: Date;
  intentionDates: Set<string>;
  isLoading: boolean;
  fetchError: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
  onRetry: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarHistoryUI({
  displayedMonth,
  intentionDates,
  isLoading,
  fetchError,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onRetry,
}: CalendarHistoryUIProps) {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // Build calendar grid cells
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const toDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <section className="flex flex-col gap-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">History</h1>

      {/* Error banner */}
      {fetchError && (
        <ErrorBanner
          message={fetchError}
          onRetry={onRetry}
        />
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>

        <h2 className="text-base font-semibold text-white">
          {getMonthName(displayedMonth)}
        </h2>

        <button
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          aria-label="Next month"
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>

      {/* Calendar grid */}
      <div
        className={clsx(
          'card transition-opacity duration-200',
          isLoading && 'opacity-50',
        )}
        aria-busy={isLoading}
        aria-label={`Calendar for ${getMonthName(displayedMonth)}`}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-white/30 py-1"
              aria-hidden
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} aria-hidden />;
            }

            const dateStr = toDateStr(day);
            const hasIntention = intentionDates.has(dateStr);
            const isToday =
              isCurrentMonth && day === today.getDate();

            return (
              <div key={dateStr} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => hasIntention && onDayClick(dateStr)}
                  disabled={!hasIntention}
                  aria-label={`${dateStr}${hasIntention ? ', has intention' : ''}`}
                  aria-pressed={undefined}
                  className={clsx(
                    'relative w-9 h-9 rounded-full flex flex-col items-center justify-center text-sm transition-colors duration-150',
                    isToday && 'ring-1 ring-brand-400',
                    hasIntention
                      ? 'text-white hover:bg-brand-500/30 cursor-pointer'
                      : 'text-white/30 cursor-default',
                  )}
                >
                  {day}
                  {hasIntention && (
                    <span
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-400"
                      aria-hidden
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!isLoading && !fetchError && intentionDates.size === 0 && (
        <EmptyState
          icon={<Calendar size={40} />}
          title="No intentions recorded yet"
          description="Set your first intention this morning to start your history."
        />
      )}
    </section>
  );
}
