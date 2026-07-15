import { type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2 } from '@/utils/icons';
import { ErrorBanner } from '@/components/error-banner';
import clsx from 'clsx';

interface SignInUIProps {
  email: string;
  isSubmitting: boolean;
  clientError: string | null;
  serverError: string | null;
  onEmailChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

export function SignInUI({
  email,
  isSubmitting,
  clientError,
  serverError,
  onEmailChange,
  onSubmit,
}: SignInUIProps) {
  const hasError = clientError ?? serverError;

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-5 py-12 max-w-md mx-auto">
      {/* Logo / brand */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl" aria-hidden>☀️</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Sign in to DayDrop</h1>
        <p className="text-white/50 text-sm mt-2">
          No password needed — we'll send you a magic link.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="w-full space-y-4">
        {/* Error banners */}
        {serverError && <ErrorBanner message={serverError} />}

        {/* Email field */}
        <div>
          <label htmlFor="email-input" className="block text-sm font-medium text-white/70 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              aria-hidden
            />
            <input
              id="email-input"
              type="email"
              name="email"
              value={email}
              onChange={onEmailChange}
              disabled={isSubmitting}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={clsx(
                'input-field pl-10',
                clientError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              )}
              aria-describedby={clientError ? 'email-error' : undefined}
              aria-invalid={!!clientError}
            />
          </div>
          {clientError && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-400">
              {clientError}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            'Send magic link'
          )}
        </button>
      </form>

      {/* Anonymous mode */}
      <div className="mt-6 text-center">
        <p className="text-white/30 text-xs mb-2">No account? No problem.</p>
        <Link
          to="/"
          className={clsx('btn-ghost text-sm', hasError && 'opacity-50')}
        >
          Continue without account
        </Link>
      </div>
    </div>
  );
}
