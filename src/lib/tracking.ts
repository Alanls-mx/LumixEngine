import {
  cookieConsentChangedEvent,
  getCookieConsentPreference,
  type CookieConsentPreference,
} from './cookieSettings';

type TrackingParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const ga4Id = import.meta.env.VITE_GA_ID;
const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
let trackingInitialized = false;
let consentListenerInitialized = false;

function isConfigured(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !value.includes('XXXX') && !/^0+$/.test(value);
}

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initializeGa4(id: string) {
  (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = false;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtagStub() {
    window.dataLayer?.push(arguments);
  };

  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`, 'lumix-ga4');
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: true });
}

function initializeMetaPixel(id: string) {
  if (!window.fbq) {
    const fbq = function fbqStub(...args: unknown[]) {
      fbq.queue.push(args);
    } as ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      loaded: boolean;
      version: string;
      queue: unknown[];
      push: (...args: unknown[]) => void;
    };

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  loadScript('https://connect.facebook.net/en_US/fbevents.js', 'lumix-meta-pixel');
  window.fbq('consent', 'grant');
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

function enableTracking() {
  if (trackingInitialized) {
    if (isConfigured(ga4Id)) {
      (window as unknown as Record<string, unknown>)[`ga-disable-${ga4Id}`] = false;
      window.gtag?.('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
    }

    window.fbq?.('consent', 'grant');
    return;
  }

  if (isConfigured(ga4Id)) {
    initializeGa4(ga4Id);
  }

  if (isConfigured(metaPixelId)) {
    initializeMetaPixel(metaPixelId);
  }

  trackingInitialized = true;
}

function expireTrackingCookies() {
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0]?.trim())
    .filter((name) => name && (name.startsWith('_ga') || name === '_gid' || name === '_fbp' || name === '_fbc'));

  for (const cookieName of cookieNames) {
    document.cookie = `${cookieName}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${cookieName}=; Max-Age=0; path=/; domain=.lumixengine.com; SameSite=Lax`;
  }
}

function disableTracking() {
  if (isConfigured(ga4Id)) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${ga4Id}`] = true;
    window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
  }

  window.fbq?.('consent', 'revoke');
  expireTrackingCookies();
}

function applyTrackingPreference(preference: CookieConsentPreference | null) {
  if (preference === 'accepted') {
    enableTracking();
    return;
  }

  disableTracking();
}

export function initializeTracking() {
  applyTrackingPreference(getCookieConsentPreference());

  if (consentListenerInitialized) {
    return;
  }

  window.addEventListener(cookieConsentChangedEvent, (event) => {
    applyTrackingPreference((event as CustomEvent<CookieConsentPreference>).detail);
  });
  consentListenerInitialized = true;
}

export function trackEvent(eventName: string, params: TrackingParams = {}) {
  if (getCookieConsentPreference() !== 'accepted') {
    return;
  }

  const payload = {
    event_category: 'lumixengine_landing',
    ...params,
  };

  window.dataLayer?.push({ event: eventName, ...payload });
  window.gtag?.('event', eventName, payload);
  window.fbq?.('trackCustom', eventName, payload);
}
