import { type FormEvent, type ChangeEvent } from 'react';
import { Loader2, Sun } from '@/utils/icons';
import { ErrorBanner } from '@/components/error-banner';
import { INTENTION_MAX_CHARS } from '@/constants';
import clsx from 'clsx';

interface MorningHomeUIProps {
  intentionText: string;
  charCount: number;
  isSubmitting: boolean;
  serverError: string | null;
  previousIntentionText: string | null;
  todayAlreadySaved: boolean;
  onTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

export function MorningHomeUI({
  intentionText,
  charCount,
  isSubmitting,
  serverError,
  previousIntentionText,
  todayAlreadySaved,
  onTextChange,
  onSubmit,
}: MorningHomeUIProps) {
  const isOverLimit = charCount > INTENTION_MAX_CHARS;
  const canSubmit = charCount >= 1 && !isOverLimit && !todayAlreadySaved && !isSubmitting;

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center gap-2">
        <Sun size={24} className="text-brand-400" aria-hidden />
        <h1 className="text-2xl font-bold text-white">Good morning</h1>
      </div>

      <p className="text-white/60 text-sm -mt-3">
        What's your one intention for today?
      </p>

      {/* Intention form */}
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-3">
          {/* Text area */}
          <div className="relative">
            <label htmlFor="intention-input" className="sr-only">
              Today's intention
            </label>
            <textarea
              id="intention-input"
              name="intention"
              value={intentionText}
              onChange={onTextChange}
              readOnly={todayAlreadySaved}
              disabled={isSubmitting}
              placeholder="e.g. Focus on deep work and avoid context-switching today."
              rows={4}
              maxLength={INTENTION_MAX_CHARS + 20}
              className={clsx(
                'input-field',
                isOverLimit && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                todayAlreadySaved && 'opacity-70 cursor-default',
              )}
              aria-describedby={
                isOverLimit ? 'char-error' : serverError ? 'server-error' : undefined
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
                  e.preventDefault();
                  onSubmit(e as unknown as FormEvent);
                }
              }}
            />
            {/* Character count */}
            <div
              className={clsx(
                'absolute bottom-3 right-3 text-xs tabular-nums',
                isOverLimit ? 'text-red-400' : charCount > 120 ? 'text-yellow-400' : 'text-white/30',
              )}
              aria-live="polite"
              aria-atomic="true"
            >
              {charCount}/{INTENTION_MAX_CHARS}
            </div>
          </div>

          {/* Char limit error */}
          {isOverLimit && (
            <p id="char-error" role="alert" className="text-red-400 text-xs">
              Intention must be 140 characters or fewer.
            </p>
          )}

          {/* Server error */}
          {serverError && (
            <div id="server-error">
              <ErrorBanner message={serverError} />
            </div>
          )}

          {/* Submit / saved state */}
          {todayAlreadySaved ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-3 text-green-400 text-sm font-medium"
            >
              <span aria-hidden>✓</span> Intention saved for today
            </div>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary w-full flex items-center justify-center gap-2"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Set intention'
              )}
            </button>
          )}
        </div>
      </form>

      {/* Yesterday's intention context */}
      <aside aria-label="Yesterday's intention">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
          Yesterday
        </h2>
        <div className="card">
          {previousIntentionText ? (
            <p className="text-white/70 text-sm leading-relaxed">{previousIntentionText}</p>
          ) : (
            <p className="text-white/30 text-sm italic">
              No previous intention found. Start fresh today.
            </p>
          )}
        </div>
      </aside>
    </section>
  );
}
