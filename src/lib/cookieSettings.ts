export const cookieConsentKey = 'cookie_consent';
export const openCookieSettingsEvent = 'lumixengine:open-cookie-settings';

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(openCookieSettingsEvent));
}

