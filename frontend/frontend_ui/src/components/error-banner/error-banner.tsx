import { AlertCircle, RefreshCw } from '@/utils/icons';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div role="alert" className="error-banner flex items-start gap-3">
      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition-colors"
          >
            <RefreshCw size={12} aria-hidden />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
