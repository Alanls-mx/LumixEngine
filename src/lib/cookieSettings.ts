export const cookieConsentKey = 'cookie_consent';
export const openCookieSettingsEvent = 'lumixengine:open-cookie-settings';
export const cookieConsentChangedEvent = 'lumixengine:cookie-consent-changed';

export type CookieConsentPreference = 'accepted' | 'rejected';

export function getCookieConsentPreference(): CookieConsentPreference | null {
  const storedPreference = window.localStorage.getItem(cookieConsentKey);

  if (storedPreference === 'accepted' || storedPreference === 'true') {
    return 'accepted';
  }

  if (storedPreference === 'rejected' || storedPreference === 'false') {
    return 'rejected';
  }

  return null;
}

export function setCookieConsentPreference(preference: CookieConsentPreference) {
  window.localStorage.setItem(cookieConsentKey, preference);
  window.dispatchEvent(new CustomEvent(cookieConsentChangedEvent, { detail: preference }));
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(openCookieSettingsEvent));
}
