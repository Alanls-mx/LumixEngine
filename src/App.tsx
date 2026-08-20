import { lazy, Suspense, type ReactNode, useEffect, useRef, useState } from 'react';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { HeaderMenu } from './components/HeaderMenu';
import { ScenarioProvider } from './context/ScenarioContext';

const Solucoes = lazy(() => import('./components/Solucoes').then((module) => ({ default: module.Solucoes })));
const EcosystemSection = lazy(() =>
  import('./components/EcosystemSection').then((module) => ({ default: module.EcosystemSection })),
);
const Testimonials = lazy(() =>
  import('./components/Testimonials').then((module) => ({ default: module.Testimonials })),
);
const FAQ = lazy(() => import('./components/FAQ').then((module) => ({ default: module.FAQ })));
const LeadCapture = lazy(() => import('./components/LeadCapture').then((module) => ({ default: module.LeadCapture })));
const CookieConsent = lazy(() =>
  import('./components/CookieConsent').then((module) => ({ default: module.CookieConsent })),
);
const DiagnosticModal = lazy(() =>
  import('./components/DiagnosticModal').then((module) => ({ default: module.DiagnosticModal })),
);
const LegalPage = lazy(() => import('./components/LegalPage').then((module) => ({ default: module.LegalPage })));
const NotFoundPage = lazy(() =>
  import('./components/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

const siteUrl = 'https://lumixengine.com';

const routeMetadata = {
  home: {
    title: 'LumixEngine | Soluções digitais sob medida',
    description:
      'LumixEngine desenvolve sites, landing pages, lojas virtuais, sistemas web, automações e integrações sob medida para negócios locais.',
    path: '/',
    robots: 'index, follow',
  },
  privacy: {
    title: 'Política de Privacidade | LumixEngine',
    description:
      'Entenda como a LumixEngine trata dados enviados pelo site, formulários e canais de contato comercial.',
    path: '/politica-de-privacidade',
    robots: 'index, follow',
  },
  terms: {
    title: 'Termos de Uso | LumixEngine',
    description:
      'Confira as condições de uso do site, conteúdos demonstrativos e canais comerciais da LumixEngine.',
    path: '/termos-de-uso',
    robots: 'index, follow',
  },
  notFound: {
    title: 'Página não encontrada | LumixEngine',
    description:
      'A página solicitada não foi encontrada. Volte para a LumixEngine e conheça soluções digitais sob medida.',
    path: '/',
    robots: 'noindex, follow',
  },
} as const;

function setMetaContent(selector: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);

  if (element) {
    element.content = content;
  }
}

function setCanonicalUrl(url: string) {
  const element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (element) {
    element.href = url;
  }
}

export function App() {
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/';
  const legalPageType =
    currentPath === '/politica-de-privacidade'
      ? 'privacy'
      : currentPath === '/termos-de-uso'
        ? 'terms'
        : null;
  const pageMetadata = legalPageType ? routeMetadata[legalPageType] : isHomePage ? routeMetadata.home : routeMetadata.notFound;

  useEffect(() => {
    const absoluteUrl = `${siteUrl}${pageMetadata.path}`;

    document.title = pageMetadata.title;
    setCanonicalUrl(absoluteUrl);
    setMetaContent('meta[name="description"]', pageMetadata.description);
    setMetaContent('meta[name="robots"]', pageMetadata.robots);
    setMetaContent('meta[property="og:title"]', pageMetadata.title);
    setMetaContent('meta[property="og:description"]', pageMetadata.description);
    setMetaContent('meta[property="og:url"]', absoluteUrl);
    setMetaContent('meta[name="twitter:title"]', pageMetadata.title);
    setMetaContent('meta[name="twitter:description"]', pageMetadata.description);
  }, [pageMetadata]);

  return (
    <ScenarioProvider>
      <HeaderMenu onOpenBudgetForm={() => setIsBudgetModalOpen(true)} />
      {legalPageType ? (
        <Suspense fallback={null}>
          <LegalPage type={legalPageType} />
        </Suspense>
      ) : isHomePage ? (
        <main className="overflow-hidden">
          <Hero onOpenBudgetForm={() => setIsBudgetModalOpen(true)} />
          <DeferredSection minHeight={620}>
            <Solucoes />
          </DeferredSection>
          <DeferredSection minHeight={760}>
            <EcosystemSection />
          </DeferredSection>
          <DeferredSection minHeight={720}>
            <Testimonials />
          </DeferredSection>
          <DeferredSection minHeight={620}>
            <FAQ />
          </DeferredSection>
          <DeferredSection minHeight={520}>
            <LeadCapture />
          </DeferredSection>
        </main>
      ) : (
        <Suspense fallback={null}>
          <NotFoundPage />
        </Suspense>
      )}
      <Footer />
      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>
      {isBudgetModalOpen ? (
        <Suspense fallback={null}>
          <DiagnosticModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} />
        </Suspense>
      ) : null}
    </ScenarioProvider>
  );
}

function DeferredSection({ children, minHeight }: { children: ReactNode; minHeight: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || shouldRender) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '720px 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={containerRef} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense> : null}
    </div>
  );
}
