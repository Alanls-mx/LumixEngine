import { useCallback, useState, type MouseEvent } from 'react';
import { Menu } from 'lucide-react';

type HeaderMenuProps = {
  onOpenBudgetForm: () => void;
};

export function HeaderMenu({ onOpenBudgetForm }: HeaderMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = 'mobile-menu';

  const handleSmoothScroll = useCallback((event: MouseEvent<HTMLElement>, targetId: string) => {
    event.preventDefault();

    const targetElement = document.querySelector<HTMLElement>(targetId);

    if (!targetElement) {
      window.location.href = `/${targetId}`;
      return;
    }

    const headerOffset = 96;
    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });

    setIsMenuOpen(false);
  }, []);

  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <nav
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 min-[360px]:gap-6 min-[360px]:px-5 sm:px-6 lg:gap-8 lg:py-4"
        aria-label="Menu principal"
      >
        <a
          href="/"
          className="flex flex-shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label="LumixEngine início"
        >
          <img
            src="/assets/lumix-logo-header-cropped.webp"
            alt="LumixEngine"
            className="h-11 w-auto max-w-[210px] flex-shrink-0 object-contain min-[360px]:h-12 min-[360px]:max-w-[240px] md:h-14 md:max-w-[300px]"
            width={412}
            height={86}
            loading="eager"
            decoding="async"
          />
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-200 md:flex">
          <a href="#solucoes" className="transition hover:text-white" onClick={(event) => handleSmoothScroll(event, '#solucoes')}>
            Soluções
          </a>
          <a href="#beneficios" className="transition hover:text-white" onClick={(event) => handleSmoothScroll(event, '#beneficios')}>
            Benefícios
          </a>
          <a href="#contato" className="transition hover:text-white" onClick={(event) => handleSmoothScroll(event, '#contato')}>
            Contato
          </a>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenBudgetForm}
            className="hidden rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-[0_18px_46px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night sm:inline-flex"
          >
            Solicitar Proposta
          </button>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-800 bg-panel text-white transition hover:border-emerald-500/30 lg:hidden"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div
        id={mobileMenuId}
        className={isMenuOpen ? 'block border-t border-borderline px-3 pb-4 min-[360px]:px-5 lg:hidden' : 'hidden'}
      >
        <div className="grid grid-cols-1 gap-2 pt-4 text-center text-sm font-bold text-slate-300 min-[360px]:grid-cols-3">
          <a
            href="#solucoes"
            className="rounded-lg border border-slate-800 bg-panel px-3 py-2"
            onClick={(event) => handleSmoothScroll(event, '#solucoes')}
          >
            Soluções
          </a>
          <a
            href="#beneficios"
            className="rounded-lg border border-slate-800 bg-panel px-3 py-2"
            onClick={(event) => handleSmoothScroll(event, '#beneficios')}
          >
            Benefícios
          </a>
          <a
            href="#contato"
            className="rounded-lg border border-slate-800 bg-panel px-3 py-2"
            onClick={(event) => handleSmoothScroll(event, '#contato')}
          >
            Contato
          </a>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              onOpenBudgetForm();
            }}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 min-[360px]:col-span-3"
          >
            Solicitar Proposta
          </button>
        </div>
      </div>
    </header>
  );
}
