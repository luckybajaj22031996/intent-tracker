import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return <div className={clsx('skeleton h-4 w-full', className)} aria-hidden />;
  }

  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'skeleton h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full',
            className,
          )}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3 animate-pulse" aria-busy aria-label="Loading…">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-5 w-full" />
      <div className="skeleton h-5 w-4/5" />
    </div>
  );
}
