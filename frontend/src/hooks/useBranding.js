import { useEffect, useState } from 'react';

import { applyBrandingSettings, readBrandingSettings } from '../utils/branding';

export const useBranding = () => {
  const [branding, setBranding] = useState(() => readBrandingSettings());

  useEffect(() => {
    applyBrandingSettings(branding);
  }, [branding]);

  useEffect(() => {
    const syncBranding = () => {
      setBranding(readBrandingSettings());
    };

    const syncFromEvent = (event) => {
      setBranding(event.detail || readBrandingSettings());
    };

    window.addEventListener('storage', syncBranding);
    window.addEventListener('branding-updated', syncFromEvent);

    return () => {
      window.removeEventListener('storage', syncBranding);
      window.removeEventListener('branding-updated', syncFromEvent);
    };
  }, []);

  return branding;
};
