import { ArrowRight } from 'lucide-react';
import { cinemaCasePath, portfolioHighlights } from '../constants/portfolio';

export function PortfolioPage() {
  return (
    <main className="portfolio-surface bg-[#070b13]">
      <section className="portfolio-hero relative flex min-h-[78svh] items-end overflow-hidden pt-24">
        <img
          src="/assets/portfolio/cinemas/cinema-hero.webp"
          alt="Operador de cinema validando um ingresso digital"
          className="absolute inset-0 h-full w-full object-cover object-center"
          width={1920}
          height={1080}
          loading="eager"
        />
        <div className="portfolio-hero-shade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="max-w-4xl">
            <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.06] text-white sm:text-6xl lg:text-7xl">
              Plataforma digital completa para cinemas
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Um ecossistema criado pela LumixEngine para conectar descoberta, venda, operação e relacionamento em uma experiência única.
            </p>
            <a
              href={cinemaCasePath}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#070b13]"
            >
              Ver Case Completo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="portfolio-gallery-title">
        <div className="mb-12 max-w-3xl">
          <h2 id="portfolio-gallery-title" className="text-balance text-3xl font-extrabold text-white sm:text-5xl">
            Projetos vistos por dentro
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Cada entrega combina experiência do cliente e operação. Explore os principais capítulos deste projeto para cinemas.
          </p>
        </div>

        <div className="portfolio-grid">
          {portfolioHighlights.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className={`portfolio-card group relative overflow-hidden rounded-2xl bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 ${item.size}`}
              aria-label={`${item.title}: ${item.description}`}
            >
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.025]"
                loading="lazy"
                decoding="async"
              />
              <span className="portfolio-card-shade absolute inset-0 transition duration-300" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <span className="block text-xl font-extrabold text-white sm:text-2xl">{item.title}</span>
                <span className="mt-2 block max-w-xl text-sm leading-6 text-slate-200 opacity-100 transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                  {item.description}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800 bg-[#0b111d]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-6 md:flex-row md:items-end lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">Seu cinema pode ter uma experiência própria.</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              A arquitetura pode ser reaplicada, mas a interface, a identidade e os fluxos são desenhados para cada operação.
            </p>
          </div>
          <a
            href="/#contato"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-slate-600 px-5 py-3 text-sm font-extrabold text-white transition hover:border-emerald-300 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Conversar sobre um projeto
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
