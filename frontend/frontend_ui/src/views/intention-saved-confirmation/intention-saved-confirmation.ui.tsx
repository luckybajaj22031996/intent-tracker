import { Link } from 'react-router-dom';
import { CheckCircle2, Calendar } from '@/utils/icons';

interface IntentionSavedUIProps {
  savedIntentionText: string;
}

export function IntentionSavedUI({ savedIntentionText }: IntentionSavedUIProps) {
  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-5 py-12 max-w-md mx-auto animate-fade-in">
      {/* Success icon */}
      <div className="mb-6">
        <CheckCircle2 size={64} className="text-green-400" aria-hidden />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Intention set
      </h1>
      <p className="text-white/60 text-center text-sm mb-8">
        Your intention for today has been saved.
      </p>

      {/* Echo block */}
      <div className="w-full card mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
          Today's intention
        </p>
        {savedIntentionText ? (
          <p className="text-white leading-relaxed">{savedIntentionText}</p>
        ) : (
          <p className="text-white/40 italic text-sm">Your intention has been saved.</p>
        )}
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        <Link
          to="/history"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Calendar size={18} aria-hidden />
          View History
        </Link>
        <Link
          to="/"
          className="btn-ghost w-full flex items-center justify-center"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
