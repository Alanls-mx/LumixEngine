import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, Settings, X } from 'lucide-react';
import { cookieConsentKey, openCookieSettingsEvent } from '../lib/cookieSettings';

function hasCookieConsent() {
  return window.localStorage.getItem(cookieConsentKey) === 'true';
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!hasCookieConsent());

    const handleOpenSettings = () => setIsVisible(true);
    window.addEventListener(openCookieSettingsEvent, handleOpenSettings);

    return () => window.removeEventListener(openCookieSettingsEvent, handleOpenSettings);
  }, []);

  const acceptCookies = useCallback(() => {
    window.localStorage.setItem(cookieConsentKey, 'true');
    setIsVisible(false);
  }, []);

  const revokeCookies = useCallback(() => {
    window.localStorage.removeItem(cookieConsentKey);
    setIsVisible(false);
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-safe min-[360px]:px-4 md:px-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
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
                  Usamos cookies de medição somente após consentimento para entender conversões e melhorar o site. Salvamos localmente apenas a preferência de aceite.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row md:ml-auto md:mt-0 md:flex-shrink-0">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition hover:border-emerald-500/30 hover:bg-emerald-400/10"
                onClick={revokeCookies}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Agora não
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-extrabold text-emerald-950 shadow-violet transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)]"
                onClick={acceptCookies}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Aceitar cookies
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
