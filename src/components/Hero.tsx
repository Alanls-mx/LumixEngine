import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { heroContent, whatsappLinks } from '../constants/content';

const MockChat = lazy(() => import('./MockChat').then((module) => ({ default: module.MockChat })));

type HeroProps = {
  onOpenBudgetForm: () => void;
};

export function Hero({ onOpenBudgetForm }: HeroProps) {
  return (
    <section
      className="hero-glow relative overflow-hidden px-3 pb-14 pt-24 min-[360px]:px-5 min-[360px]:pb-16 md:px-8 md:pb-20 md:pt-28"
      aria-labelledby="hero-title"
    >
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="hero-reveal mb-6 inline-flex items-center gap-3 text-sm font-extrabold text-emerald-100">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Projetos digitais para operações reais
          </div>

          <h1
            id="hero-title"
            className="max-w-5xl break-words text-[clamp(2rem,11vw,3.75rem)] font-extrabold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl"
          >
            {heroContent.title}
          </h1>

          <p
            className="mt-5 max-w-2xl text-base leading-7 text-slate-300 min-[360px]:mt-6 min-[360px]:text-lg min-[360px]:leading-8 md:text-xl"
          >
            {heroContent.subtitle}
          </p>

          <div className="hero-reveal hero-reveal-delay-1 mt-9 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onOpenBudgetForm}
              className="hidden items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.24)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night min-[360px]:inline-flex"
            >
              {heroContent.primaryCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenBudgetForm}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-extrabold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.24)] transition-all duration-300 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night min-[360px]:hidden"
            >
              Solicitar Proposta
            </button>
            <a
              href={whatsappLinks.budget}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night min-[360px]:px-6 min-[360px]:text-base"
            >
              Conversar no WhatsApp
              <MessageCircle className="ml-2 h-4 w-4 text-emerald-300" aria-hidden="true" />
            </a>
          </div>

          <div className="hero-reveal hero-reveal-delay-2 mt-9 hidden gap-3 text-sm font-semibold text-slate-200 min-[360px]:grid sm:grid-cols-3">
            {heroContent.benefits.map((benefit) => (
              <div className="flex items-center gap-2" key={benefit.label}>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                {benefit.label}
              </div>
            ))}
          </div>
        </div>

        <DeferredMockChat />
      </div>
    </section>
  );
}

function DeferredMockChat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(min-width: 360px)').matches) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const load = () => {
      const idleCallback = 'requestIdleCallback' in window ? window.requestIdleCallback(() => setShouldLoad(true), { timeout: 900 }) : undefined;
      const timeout = idleCallback === undefined ? window.setTimeout(() => setShouldLoad(true), 160) : undefined;

      return () => {
        if (idleCallback !== undefined && 'cancelIdleCallback' in window) {
          window.cancelIdleCallback(idleCallback);
        }

        if (timeout !== undefined) {
          window.clearTimeout(timeout);
        }
      };
    };

    let cancelLoad: (() => void) | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        cancelLoad = load();
        observer.disconnect();
      },
      { threshold: 0.12 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelLoad?.();
    };
  }, []);

  return (
    <div ref={containerRef} className="hidden min-h-[620px] min-[360px]:block">
      {shouldLoad ? (
        <Suspense fallback={<MockChatShell />}>
          <MockChat />
        </Suspense>
      ) : (
        <MockChatShell />
      )}
    </div>
  );
}

function MockChatShell() {
  return (
    <div
      className="mx-auto h-[620px] w-full max-w-[390px] rounded-[2.35rem] border border-slate-800 bg-slate-950/60 shadow-[0_28px_90px_rgba(0,0,0,0.36)]"
      aria-hidden="true"
    />
  );
}
