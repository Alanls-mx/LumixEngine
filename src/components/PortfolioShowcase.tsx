import { ArrowRight, Check } from 'lucide-react';
import { cinemaCasePath } from '../constants/portfolio';

const connectedAreas = [
  'Compra online e bilheteria',
  'Ingressos e validação',
  'Bomboniere e clube',
  'Financeiro e operação',
] as const;

export function PortfolioShowcase() {
  return (
    <section className="border-y border-slate-800 bg-[#070b13]" aria-labelledby="portfolio-showcase-title">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <a
          href={cinemaCasePath}
          className="group relative min-h-[24rem] overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:min-h-[30rem]"
          aria-label="Abrir case da plataforma para cinemas"
        >
          <img
            src="/assets/portfolio/cinemas/cinema-hero.webp"
            alt="Operador validando um ingresso digital na entrada da sala"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
          <span className="portfolio-card-shade absolute inset-0" aria-hidden="true" />
          <span className="absolute inset-x-0 bottom-0 p-6 text-lg font-extrabold text-white sm:p-8 sm:text-2xl">
            Um sistema que acompanha a experiência até a entrada da sala
          </span>
        </a>

        <div className="max-w-xl">
          <h2 id="portfolio-showcase-title" className="text-balance text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Veja como transformamos uma operação inteira em produto digital
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
            O case para cinemas mostra como a LumixEngine conecta a experiência do cliente ao trabalho diário da equipe, sem depender de sistemas isolados.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {connectedAreas.map((area) => (
              <li key={area} className="flex items-start gap-3 text-sm font-bold leading-6 text-slate-200">
                <Check className="mt-0.5 h-5 w-5 flex-none text-emerald-300" aria-hidden="true" />
                {area}
              </li>
            ))}
          </ul>
          <a
            href={cinemaCasePath}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#070b13]"
          >
            Explorar o case
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
