import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings, Sun, Moon } from '@/utils/icons';
import { isEveningMode } from '@/utils/format';
import clsx from 'clsx';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/history', label: 'History', icon: Calendar, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function AppShell({ children }: AppShellProps) {
  const evening = isEveningMode();

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {evening ? (
            <Moon size={20} className="text-brand-400" aria-hidden />
          ) : (
            <Sun size={20} className="text-brand-400" aria-hidden />
          )}
          <span className="font-semibold text-white tracking-tight">DayDrop</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-5 py-6">{children}</main>

      {/* Bottom navigation */}
      <nav
        aria-label="Main navigation"
        className="border-t border-white/5 bg-surface/95 backdrop-blur-sm pb-safe"
      >
        <ul className="flex items-center justify-around py-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors duration-150',
                    isActive
                      ? 'text-brand-400'
                      : 'text-white/40 hover:text-white/70',
                  )
                }
                aria-label={label}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={22} aria-hidden />
                    <span className={clsx('text-xs font-medium', isActive ? 'text-brand-400' : '')}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
