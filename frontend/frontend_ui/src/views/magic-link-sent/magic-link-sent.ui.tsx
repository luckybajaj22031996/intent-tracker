import { Link } from 'react-router-dom';
import { Mail } from '@/utils/icons';

interface MagicLinkSentUIProps {
  email?: string;
}

export function MagicLinkSentUI({ email }: MagicLinkSentUIProps) {
  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-5 py-12 max-w-md mx-auto animate-fade-in">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-6">
        <Mail size={36} className="text-brand-400" aria-hidden />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-white text-center mb-3">
        Check your inbox
      </h1>

      <p className="text-white/60 text-center text-sm leading-relaxed mb-2">
        We've sent a magic link to{' '}
        {email ? (
          <strong className="text-white">{email}</strong>
        ) : (
          'your email address'
        )}
        .
      </p>

      <p className="text-white/40 text-center text-sm mb-8">
        The link expires in 10 minutes. Check your spam folder if you don't see it.
      </p>

      {/* Help text */}
      <div className="w-full card text-center mb-8">
        <p className="text-white/50 text-sm">
          Didn't receive the email?{' '}
          <Link to="/sign-in" className="text-brand-400 hover:text-brand-300 transition-colors">
            Try again
          </Link>
        </p>
      </div>

      {/* Continue anonymously */}
      <Link to="/" className="btn-ghost text-sm">
        Continue without signing in
      </Link>
    </div>
  );
}
