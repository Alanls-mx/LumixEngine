import { useEffect, useState } from 'react';
import { EcosystemSection } from './components/EcosystemSection';
import { Hero } from './components/Hero';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { HeaderMenu } from './components/HeaderMenu';
import { LeadCapture } from './components/LeadCapture';
import { DiagnosticModal } from './components/DiagnosticModal';
import { CookieConsent } from './components/CookieConsent';
import { LegalPage } from './components/LegalPage';
import { NotFoundPage } from './components/NotFoundPage';
import { Solucoes } from './components/Solucoes';
import { Testimonials } from './components/Testimonials';
import { ScenarioProvider } from './context/ScenarioContext';

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
        <LegalPage type={legalPageType} />
      ) : isHomePage ? (
        <main className="overflow-hidden">
          <Hero onOpenBudgetForm={() => setIsBudgetModalOpen(true)} />
          <Solucoes />
          <EcosystemSection />
          <Testimonials />
          <FAQ />
          <LeadCapture />
        </main>
      ) : (
        <NotFoundPage />
      )}
      <Footer />
      <CookieConsent />
      <DiagnosticModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} />
    </ScenarioProvider>
  );
}
