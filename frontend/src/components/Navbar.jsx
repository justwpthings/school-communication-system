import { Button } from './Button';
import { useBranding } from '../hooks/useBranding';

export const Navbar = ({ title, subtitle, user, onLogout }) => {
  const branding = useBranding();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {branding.logo ? (
              <img
                src={branding.logo}
                alt={`${branding.schoolName} logo`}
                className="h-12 w-12 rounded-2xl object-cover shadow-soft"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-soft"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {(branding.schoolName || 'S').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-ink">{branding.schoolName}</p>
              <p className="truncate text-sm text-muted">{title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
            </div>
            <Button variant="secondary" className="px-4 py-2.5" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </div>

        {subtitle ? (
          <div className="max-w-3xl">
            <p className="text-sm leading-6 text-muted">{subtitle}</p>
          </div>
        ) : null}
      </div>
    </header>
  );
};
