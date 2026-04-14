import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useBranding } from '../hooks/useBranding';

export const PrivacyPage = () => {
  const branding = useBranding();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full space-y-6 rounded-[32px]">
        <div className="flex items-center gap-4">
          {branding.logo ? (
            <img
              src={branding.logo}
              alt={`${branding.schoolName} logo`}
              className="h-14 w-14 rounded-2xl object-cover shadow-soft"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-semibold text-white shadow-soft"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {(branding.schoolName || 'S').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Legal</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
            <p className="mt-1 text-sm text-muted">{branding.schoolName}</p>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/85 p-6 shadow-soft ring-1 ring-black/[0.04]">
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted">{branding.privacyPolicy}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/login">
            <Button>Back to login</Button>
          </Link>
          <Link to="/terms">
            <Button variant="secondary">View terms of use</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
