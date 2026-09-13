import { useCallback, useEffect, useState } from 'react';
import { Cookie, Settings, X } from 'lucide-react';
import {
  getCookieConsentPreference,
  openCookieSettingsEvent,
  setCookieConsentPreference,
} from '../lib/cookieSettings';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(getCookieConsentPreference() === null);

    const handleOpenSettings = () => setIsVisible(true);
    window.addEventListener(openCookieSettingsEvent, handleOpenSettings);

    return () => window.removeEventListener(openCookieSettingsEvent, handleOpenSettings);
  }, []);

  const acceptCookies = useCallback(() => {
    setCookieConsentPreference('accepted');
    setIsVisible(false);
  }, []);

  const rejectOptionalCookies = useCallback(() => {
    setCookieConsentPreference('rejected');
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
        <div
          className="cookie-consent fixed inset-x-0 bottom-0 z-[70] px-3 pb-safe min-[360px]:px-4 md:px-6"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
          <div className="mx-auto max-w-5xl rounded-xl border border-slate-800 bg-panel/95 p-5 shadow-soft backdrop-blur-md md:flex md:items-center md:gap-6 md:p-6">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-100">
                <Cookie className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 id="cookie-consent-title" className="text-base font-extrabold text-white">
                  Controle de cookies
                </h2>
                <p id="cookie-consent-description" className="mt-2 text-sm leading-6 text-slate-300">
                  Recursos essenciais mantêm o site funcionando. Google Analytics e Meta Pixel só são carregados se você aceitar a medição opcional.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row md:ml-auto md:mt-0 md:flex-shrink-0">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition hover:border-emerald-500/30 hover:bg-emerald-400/10"
                onClick={rejectOptionalCookies}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Recusar opcionais
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-extrabold text-emerald-950 shadow-violet transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)]"
                onClick={acceptCookies}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Aceitar medição
              </button>
            </div>
          </div>
    </div>
  );
}
