export const BRANDING_STORAGE_KEY = 'scs_admin_settings';

export const defaultBrandingSettings = {
  schoolName: 'School Communication System',
  primaryColor: '#007aff',
  logo: '',
  loginTitle: 'Welcome back',
  loginSubtitle: 'A calm, focused space for school communication.',
  termsOfUse:
    'By using this school communication system, you agree to use it responsibly for school-related updates, parent communication, and approved administrative workflows.',
  privacyPolicy:
    'This app stores account information, notifications, and school branding settings to provide a secure communication experience for admins, teachers, and parents.'
};

const normalizeHex = (value) => {
  if (!value) {
    return defaultBrandingSettings.primaryColor;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value
      .slice(1)
      .split('')
      .map((char) => `${char}${char}`)
      .join('')}`;
  }

  return defaultBrandingSettings.primaryColor;
};

const hexToRgbString = (hex) => {
  const cleanHex = normalizeHex(hex).replace('#', '');
  const value = parseInt(cleanHex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `${r}, ${g}, ${b}`;
};

export const readBrandingSettings = () => {
  try {
    const stored = localStorage.getItem(BRANDING_STORAGE_KEY);

    if (!stored) {
      return defaultBrandingSettings;
    }

    const parsed = JSON.parse(stored);

    return {
      ...defaultBrandingSettings,
      ...parsed,
      primaryColor: normalizeHex(parsed.primaryColor || defaultBrandingSettings.primaryColor)
    };
  } catch {
    return defaultBrandingSettings;
  }
};

export const applyBrandingSettings = (settings) => {
  const resolved = {
    ...defaultBrandingSettings,
    ...settings,
    primaryColor: normalizeHex(settings?.primaryColor || defaultBrandingSettings.primaryColor)
  };

  document.documentElement.style.setProperty('--primary-color', resolved.primaryColor);
  document.documentElement.style.setProperty(
    '--primary-color-rgb',
    hexToRgbString(resolved.primaryColor)
  );
  document.documentElement.style.setProperty('--school-name', `"${resolved.schoolName}"`);
  document.documentElement.style.setProperty('--logo-url', resolved.logo ? `url(${resolved.logo})` : 'none');
  document.title = resolved.schoolName;

  return resolved;
};

export const saveBrandingSettings = (settings) => {
  const resolved = applyBrandingSettings(settings);
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(resolved));
  window.dispatchEvent(new CustomEvent('branding-updated', { detail: resolved }));
  return resolved;
};
