import { ArrowRight, Globe2, PanelsTopLeft, Workflow } from 'lucide-react';
import { cinemaCasePath } from '../constants/portfolio';

const solutionAreas = [
  {
    icon: Globe2,
    title: 'Sites e comércio digital',
    description: 'Experiências responsivas para apresentar, captar clientes, organizar catálogos e vender.',
  },
  {
    icon: PanelsTopLeft,
    title: 'Sistemas web sob medida',
    description: 'Painéis, portais e ferramentas internas desenhados em torno da rotina de cada operação.',
  },
  {
    icon: Workflow,
    title: 'Automações e integrações',
    description: 'Fluxos que conectam atendimento, dados, pagamentos e serviços sem retrabalho manual.',
  },
] as const;

export function PortfolioPage() {
  return (
    <main className="portfolio-surface bg-[#070b13]">
      <section className="portfolio-hero relative flex min-h-[78svh] items-end overflow-hidden pt-24">
        <img
          src="/assets/portfolio/portfolio-hero.webp"
          alt="Ambiente de desenvolvimento com site, sistema e automação em diferentes dispositivos"
          className="absolute inset-0 h-full w-full object-cover object-center"
          width={1920}
          height={1080}
          loading="eager"
        />
        <div className="portfolio-hero-shade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="max-w-4xl">
            <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.06] text-white sm:text-6xl lg:text-7xl">
              Produtos digitais que você pode entender por dentro
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Mais do que listar entregas, mostramos jornadas, interfaces e decisões de produto em funcionamento para tornar nossa capacidade técnica verificável.
            </p>
            <a
              href="#cases"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-extrabold text-emerald-950 transition hover:-translate-y-0.5 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#070b13]"
            >
              Ver cases
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-[#0b111d]" aria-labelledby="portfolio-capabilities-title">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <h2 id="portfolio-capabilities-title" className="text-balance text-3xl font-extrabold text-white sm:text-4xl">
              Soluções que assumem a forma do negócio
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Cada projeto começa pelo problema operacional. O case mostra como tecnologia, interface e integrações respondem a esse contexto.
            </p>
          </div>

          <div className="mt-12 grid border-t border-slate-800 md:grid-cols-3">
            {solutionAreas.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-b border-slate-800 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <Icon className="h-6 w-6 text-emerald-300" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-extrabold text-white">{title}</h3>
                <p className="mt-3 max-w-[42ch] text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" className="scroll-mt-24 mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="portfolio-cases-title">
        <div className="mb-12 max-w-3xl">
          <h2 id="portfolio-cases-title" className="text-balance text-3xl font-extrabold text-white sm:text-5xl">
            Execução documentada em profundidade
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore o produto da experiência do público às ferramentas da operação, com telas e fluxos apresentados em contexto.
          </p>
        </div>

        <a
          href={cinemaCasePath}
          className="group grid overflow-hidden rounded-2xl bg-[#0b111d] focus:outline-none focus:ring-2 focus:ring-emerald-300 lg:grid-cols-[1.35fr_0.65fr]"
          aria-label="Abrir case da plataforma para cinemas"
        >
          <div className="relative min-h-[24rem] overflow-hidden sm:min-h-[32rem]">
            <img
              src="/assets/portfolio/cinemas/cinema-hero.webp"
              alt="Operação de cinema usando ingresso digital"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex flex-col justify-end border-t border-slate-800 p-7 lg:border-l lg:border-t-0 lg:p-10">
            <h3 className="text-3xl font-extrabold leading-tight text-white">Plataforma para cinemas</h3>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Um ecossistema que conecta catálogo, venda, bilheteria, ingressos, bomboniere, clube, campanhas e gestão financeira.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-300 transition group-hover:text-emerald-200">
              Explorar o case completo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </a>
      </section>

      <section className="border-t border-slate-800 bg-[#0b111d]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-6 md:flex-row md:items-end lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">A próxima solução começa pela sua operação.</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Conte o que precisa organizar, vender ou conectar. A LumixEngine transforma esse contexto em um projeto digital próprio.
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
