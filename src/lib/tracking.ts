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
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

export function initializeTracking() {
  if (isConfigured(ga4Id)) {
    initializeGa4(ga4Id);
  }

  if (isConfigured(metaPixelId)) {
    initializeMetaPixel(metaPixelId);
  }
}

export function trackEvent(eventName: string, params: TrackingParams = {}) {
  const payload = {
    event_category: 'lumixengine_landing',
    ...params,
  };

  window.dataLayer?.push({ event: eventName, ...payload });
  window.gtag?.('event', eventName, payload);
  window.fbq?.('trackCustom', eventName, payload);
}
