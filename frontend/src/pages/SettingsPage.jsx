import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useBranding } from '../hooks/useBranding';
import { AppShell } from '../layouts/AppShell';
import { adminNavItems } from '../utils/adminNav';
import {
  defaultBrandingSettings,
  readBrandingSettings,
  saveBrandingSettings
} from '../utils/branding';

export const SettingsPage = () => {
  const branding = useBranding();
  const [settings, setSettings] = useState(defaultBrandingSettings);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(readBrandingSettings());
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((current) => ({ ...current, [name]: value }));
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setSettings((current) => ({
      ...current,
      logo: dataUrl
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setIsSaving(true);

    const saved = saveBrandingSettings(settings);
    setSettings(saved);
    setStatus('Settings saved locally on this device.');
    setIsSaving(false);
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Customize the school identity while backend settings support is still pending."
      navigationItems={adminNavItems}
    >
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Appearance</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink">School settings</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              These settings are stored in local storage for now, giving the admin panel a working setup flow
              without waiting on backend support.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSave}>
            <Input
              label="School name"
              name="schoolName"
              value={settings.schoolName}
              onChange={handleChange}
              placeholder="Aurora Public School"
            />

            <Input
              label="Login title"
              name="loginTitle"
              value={settings.loginTitle}
              onChange={handleChange}
              placeholder="Welcome back"
            />

            <Input
              as="textarea"
              label="Login subtitle"
              name="loginSubtitle"
              value={settings.loginSubtitle}
              onChange={handleChange}
              placeholder="A calm, focused space for school communication."
            />

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Logo upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="rounded-2xl border border-stroke bg-white px-4 py-3 text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accentSoft file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Primary color</span>
              <div className="flex items-center gap-3 rounded-2xl border border-stroke bg-white px-4 py-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="h-10 w-14 cursor-pointer rounded-xl border-0 bg-transparent"
                />
                <span className="text-sm text-muted">{settings.primaryColor}</span>
              </div>
            </label>

            <Input
              as="textarea"
              label="Terms of Use"
              name="termsOfUse"
              value={settings.termsOfUse}
              onChange={handleChange}
              placeholder="Write the terms that should appear on the public terms page."
            />

            <Input
              as="textarea"
              label="Privacy Policy"
              name="privacyPolicy"
              value={settings.privacyPolicy}
              onChange={handleChange}
              placeholder="Write the privacy text that should appear on the public privacy page."
            />

            {status ? <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">{status}</p> : null}

            <Button type="submit" className="w-full">
              {isSaving ? 'Saving…' : 'Save settings'}
            </Button>
          </form>
        </Card>

        <Card className="soft-panel space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Preview</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Brand snapshot</h3>
          </div>

          <div
            className="rounded-[28px] p-6 shadow-soft"
            style={{
              background: `linear-gradient(135deg, ${settings.primaryColor}18, white 65%)`
            }}
          >
            <div className="flex items-center gap-4">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="School logo preview"
                  className="h-16 w-16 rounded-2xl object-cover shadow-soft"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold text-white shadow-soft"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {(settings.schoolName || 'S').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">School identity</p>
                <h4 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{settings.schoolName}</h4>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-3xl bg-white/80 p-5 ring-1 ring-black/[0.04]">
              <div>
                <p className="text-sm font-medium text-ink">Login preview</p>
                <p className="mt-1 text-sm text-muted">{settings.loginSubtitle}</p>
              </div>
              <div className="rounded-[24px] bg-[#fbfbfd] p-5 ring-1 ring-black/[0.04]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{settings.schoolName}</p>
                <h4 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{settings.loginTitle}</h4>
                <Button className="mt-4">Primary action preview</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                <Link to="/terms" className="brand-link font-medium">
                  Terms page
                </Link>
                <Link to="/privacy" className="brand-link font-medium">
                  Privacy page
                </Link>
                <span>Live brand: {branding.schoolName}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
};
