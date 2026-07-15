import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@/utils/icons';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  showBack = false,
  backTo,
  backLabel = 'Back',
  action,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="flex items-center gap-3 mb-6">
      {showBack && (
        <button
          onClick={handleBack}
          aria-label={backLabel}
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors -ml-1 p-1"
        >
          <ArrowLeft size={20} aria-hidden />
          <span className="text-sm">{backLabel}</span>
        </button>
      )}
      <h1 className="flex-1 text-xl font-semibold text-white">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  );
}
