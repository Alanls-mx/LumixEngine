import { ArrowLeft, ArrowRight, Check, MonitorSmartphone, ScanLine, TicketCheck, Utensils } from 'lucide-react';
import { cinemaCaseGallery } from '../constants/portfolio';

const capabilities = [
  { icon: MonitorSmartphone, title: 'Venda digital', text: 'Catálogo, sessões, poltronas, extras, cupons e pagamentos.' },
  { icon: TicketCheck, title: 'Bilheteria', text: 'Venda presencial, impressão e histórico no mesmo domínio.' },
  { icon: ScanLine, title: 'Acesso', text: 'QR Code, carteira digital e confirmação de entrada pelo operador.' },
  { icon: Utensils, title: 'Bomboniere', text: 'Estoque, preparo, entrega e composição financeira por item.' },
] as const;

type CinemaGalleryItem = (typeof cinemaCaseGallery)[number];

function CinemaGalleryFigure({ item }: { item: CinemaGalleryItem }) {
  return (
    <figure id={item.id} className={`case-gallery-item ${item.aspect}`}>
      <div className={`case-gallery-media overflow-hidden rounded-2xl ${item.aspect === 'portrait' ? '' : 'bg-slate-900'}`}>
        <img
          src={item.image}
          alt={item.title}
          className="h-auto w-full object-cover transition duration-500 ease-out hover:scale-[1.015]"
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption className="px-1 pb-6 pt-5">
        <h3 className="text-xl font-extrabold text-white">{item.title}</h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-6 text-slate-300">{item.description}</p>
      </figcaption>
    </figure>
  );
}

export function CinemaCasePage() {
  return (
    <main className="portfolio-surface bg-[#070b13]">
      <section className="case-hero relative flex min-h-[86svh] items-end overflow-hidden pt-24">
        <img
          src="/assets/portfolio/cinemas/cinema-hero.webp"
          alt="Experiencia de acesso a uma sala de cinema com ingresso digital"
          className="absolute inset-0 h-full w-full object-cover object-center"
          width={1920}
          height={1080}
          loading="eager"
        />
        <div className="portfolio-hero-shade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <a href="/portfolio" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-200 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Todos os projetos
          </a>
          <h1 className="max-w-5xl text-balance text-4xl font-extrabold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
            Sites e sistemas para cinemas, da compra à operação
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
            Projeto desenvolvido pela LumixEngine para reunir a experiência do público e as rotinas administrativas em uma plataforma sob medida.
          </p>
        </div>
      </section>

      <nav className="case-chapters sticky top-[68px] z-30 overflow-x-auto border-y border-slate-800 bg-[#090e18]/95" aria-label="Capitulos do case">
        <div className="mx-auto flex w-max min-w-full max-w-7xl gap-7 px-5 py-4 text-sm font-bold text-slate-300 sm:px-6 md:justify-center lg:px-8">
          <a href="#visao" className="transition hover:text-white">Visão geral</a>
          <a href="#catalogo" className="transition hover:text-white">Catálogo</a>
          <a href="#jornada" className="transition hover:text-white">Jornada</a>
          <a href="#operacao" className="transition hover:text-white">Operação</a>
          <a href="#relacionamento" className="transition hover:text-white">Relacionamento</a>
        </div>
      </nav>

      <section id="visao" className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">O Desafio</h2>
          <p className="mt-5 max-w-[66ch] text-base leading-8 text-slate-300 sm:text-lg">
            A jornada de um cinema atravessa canais que normalmente não conversam: programação, escolha de assento, pagamento, bilheteria, bomboniere, acesso à sala, clube e comunicação. Quando cada etapa vive isolada, o cliente repete informações e a equipe perde visibilidade da operação.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">A Solução</h2>
          <p className="mt-5 max-w-[66ch] text-base leading-8 text-slate-300 sm:text-lg">
            A LumixEngine projetou um ecossistema único, responsivo e orientado aos dados reais do cinema. A mesma base acompanha a compra online, a venda no balcão, a emissão do ingresso, a entrega dos extras e a leitura financeira no painel administrativo.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-[#0b111d]">
        <div className="mx-auto grid w-full max-w-7xl gap-px bg-slate-800 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-[#0b111d] px-6 py-9 lg:px-8">
              <Icon className="h-6 w-6 text-emerald-300" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-extrabold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="case-gallery-title">
        <div className="max-w-3xl">
          <h2 id="case-gallery-title" className="text-balance text-3xl font-extrabold text-white sm:text-5xl">Uma jornada, vista em contexto</h2>
          <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
            As imagens abaixo mostram interfaces e simulações ilustrativas do sistema. Cada etapa foi pensada para reduzir atrito sem esconder informações importantes da equipe.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {cinemaCaseGallery.slice(0, 2).map((item) => (
            <CinemaGalleryFigure key={item.id} item={item} />
          ))}
        </div>

        <div className="case-gallery mt-5">
          {cinemaCaseGallery.slice(2).map((item) => (
            <CinemaGalleryFigure key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-[#0b111d]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
          <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">O que a plataforma conecta</h2>
          <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {[
              'Catálogo, sessões e selos editoriais',
              'Assentos e reservas temporárias',
              'Pix, cartão, cupons e reembolsos',
              'Ingresso digital, PDF e carteira',
              'Bomboniere, estoque e entrega',
              'Clube, créditos e benefícios',
              'Campanhas e modelos de e-mail',
              'Dashboard financeiro e operacional',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-200">
                <Check className="mt-0.5 h-5 w-5 flex-none text-emerald-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="related-projects-title">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 id="related-projects-title" className="text-3xl font-extrabold text-white sm:text-4xl">Conheça outros projetos</h2>
            <p className="mt-3 text-slate-300">Continue explorando o trabalho da LumixEngine.</p>
          </div>
          <a href="/portfolio" className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-300 transition hover:text-emerald-200">
            Ver portfólio
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <a href="#jornada" className="group relative min-h-72 overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
            <img src="/assets/portfolio/cinemas/mapa-poltronas.webp" alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
            <span className="portfolio-card-shade absolute inset-0" aria-hidden="true" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-xl font-extrabold text-white">Experiência de compra</span>
          </a>
          <a href="#operacao" className="group relative min-h-72 overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
            <img src="/assets/portfolio/cinemas/bilheteria.webp" alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
            <span className="portfolio-card-shade absolute inset-0" aria-hidden="true" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-xl font-extrabold text-white">Operação no cinema</span>
          </a>
        </div>
      </section>
    </main>
  );
}
