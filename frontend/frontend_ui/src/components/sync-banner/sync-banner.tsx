import { CloudOff, Cloud } from '@/utils/icons';

interface SyncBannerProps {
  synced: boolean;
}

export function SyncBanner({ synced }: SyncBannerProps) {
  if (synced) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 text-xs text-white/40 mt-2"
    >
      <CloudOff size={12} aria-hidden />
      <span>Saved locally — will sync when online</span>
    </div>
  );
}

export function SyncedIndicator() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 text-xs text-green-400/70 mt-2"
    >
      <Cloud size={12} aria-hidden />
      <span>Synced</span>
    </div>
  );
}
