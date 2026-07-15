import { Link } from 'react-router-dom';
import { Loader2, AlertCircle } from '@/utils/icons';

interface AuthCallbackUIProps {
  verifyStatus: 'idle' | 'verifying' | 'syncing' | 'done' | 'error';
  errorMessage: string | null;
}

export function AuthCallbackUI({ verifyStatus, errorMessage }: AuthCallbackUIProps) {
  const isProcessing = verifyStatus === 'verifying' || verifyStatus === 'syncing';

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-5 py-12 max-w-md mx-auto">
      <div className="card w-full text-center">
        {isProcessing && (
          <>
            <Loader2
              size={48}
              className="animate-spin text-brand-400 mx-auto mb-4"
              aria-hidden
            />
            <h1 className="text-xl font-semibold text-white mb-2">
              {verifyStatus === 'syncing' ? 'Syncing your data…' : 'Signing you in…'}
            </h1>
            <p className="text-white/50 text-sm">Please wait a moment.</p>
          </>
        )}

        {verifyStatus === 'error' && (
          <>
            <AlertCircle
              size={48}
              className="text-red-400 mx-auto mb-4"
              aria-hidden
            />
            <h1 className="text-xl font-semibold text-white mb-2">Sign-in failed</h1>
            <p role="alert" className="text-red-300 text-sm mb-6">
              {errorMessage ?? 'Something went wrong. Please try again.'}
            </p>
            <Link to="/sign-in" className="btn-primary inline-flex">
              Request a new link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
