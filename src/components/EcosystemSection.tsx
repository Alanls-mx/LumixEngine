import { useEffect, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShoppingBag,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { EcosystemVisual, type EcosystemVisualType } from './EcosystemMocks';

type EcosystemTabId = 'capture' | 'crm' | 'scheduling' | 'commerce' | 'payments';

interface EcosystemTab {
  id: EcosystemTabId;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
  connections: readonly string[];
  visual: EcosystemVisualType;
}

const ecosystemTabs = [
  {
    id: 'capture',
    label: 'Captação e dados',
    icon: BarChart3,
    title: 'Cada oportunidade já chega com contexto.',
    description: 'Origem, interesse e prioridade seguem com o lead até a pessoa responsável pelo próximo contato.',
    connections: ['Site e formulários', 'Qualificação automática', 'Entrada no CRM'],
    visual: 'capture',
  },
  {
    id: 'crm',
    label: 'Gestão e CRM',
    icon: Users,
    title: 'A operação comercial cabe em uma única visão.',
    description: 'Pipeline, histórico, responsável e próxima ação organizados para a equipe saber exatamente o que fazer.',
    connections: ['Pipeline comercial', 'Histórico do cliente', 'Tarefas e responsáveis'],
    visual: 'crm',
  },
  {
    id: 'scheduling',
    label: 'Agenda organizada',
    icon: CalendarDays,
    title: 'Agenda, confirmação e equipe trabalhando juntas.',
    description: 'O cliente escolhe o horário, o profissional recebe a reserva e os lembretes seguem automaticamente.',
    connections: ['Disponibilidade real', 'Confirmação automática', 'Lembretes e reagendamento'],
    visual: 'scheduling',
  },
  {
    id: 'commerce',
    label: 'Loja virtual',
    icon: ShoppingBag,
    title: 'Da vitrine ao pedido, sem perder o contexto da venda.',
    description: 'Catálogo, carrinho, checkout e recuperação formam um fluxo único, ligado ao cliente e ao estoque.',
    connections: ['Catálogo e carrinho', 'Pedido e estoque', 'Recuperação de venda'],
    visual: 'commerce',
  },
  {
    id: 'payments',
    label: 'Pix e checkout',
    icon: CreditCard,
    title: 'O pagamento confirma e a operação continua.',
    description: 'Cobrança, webhook e conciliação atualizam pedido, reserva ou contrato sem conferência manual.',
    connections: ['Cobrança vinculada', 'Confirmação por webhook', 'Conciliação e histórico'],
    visual: 'payments',
  },
] satisfies readonly EcosystemTab[];

const autoplayIntervalMs = 14000;

export function EcosystemSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % ecosystemTabs.length);
    }, autoplayIntervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  const showPrevious = () => setActiveIndex((current) => (current - 1 + ecosystemTabs.length) % ecosystemTabs.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % ecosystemTabs.length);

  return (
    <section
      id="ecossistema"
      className="scroll-mt-24 overflow-hidden bg-night px-3 py-14 min-[360px]:px-5 md:px-8 md:py-20"
      aria-labelledby="ecosystem-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <h2
            id="ecosystem-title"
            className="max-w-3xl text-[clamp(1.875rem,7vw,3.5rem)] font-extrabold leading-[1.08] tracking-normal text-white"
          >
            Sistemas completos para operações reais.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-slate-300 lg:justify-self-end lg:text-lg lg:leading-8">
            Cinco exemplos de como dados, atendimento e decisões podem circular dentro de um produto construído para o seu negócio.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 grid-rows-1">
          {ecosystemTabs.map((tab, index) => {
            const isActive = activeIndex === index;

            return (
              <article
                className={`col-start-1 row-start-1 grid min-w-0 content-start gap-7 transition-[opacity,transform] duration-700 ease-out lg:grid-cols-[0.38fr_1fr] lg:gap-10 ${
                  isActive
                    ? 'pointer-events-auto z-10 translate-y-0 opacity-100'
                    : 'pointer-events-none z-0 translate-y-2 opacity-0'
                }`}
                id={`ecosystem-panel-${tab.id}`}
                role="tabpanel"
                aria-hidden={!isActive}
                aria-labelledby={`ecosystem-tab-${tab.id}`}
                aria-label={isActive ? `Exemplo de sistema: ${tab.label}` : undefined}
                inert={isActive ? undefined : true}
                key={tab.id}
              >
                <div className="flex min-w-0 flex-col border-b border-slate-800 pb-7 lg:justify-between lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                  <div>
                    <div className="flex items-center gap-3 text-sm font-bold text-emerald-300">
                      <tab.icon className="h-5 w-5" aria-hidden="true" />
                      <span>{tab.label}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-extrabold leading-tight text-white md:text-3xl">
                      {tab.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-slate-400">{tab.description}</p>
                  </div>

                  <div className="mt-8 border-t border-slate-800 pt-5">
                    <p className="text-xs font-bold uppercase text-slate-500">Módulos conectados</p>
                    <ol className="mt-4 space-y-3">
                      {tab.connections.map((connection, connectionIndex) => (
                        <li className="flex items-center gap-3 text-sm font-semibold text-slate-200" key={connection}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-xs tabular-nums text-emerald-300">
                            {connectionIndex + 1}
                          </span>
                          {connection}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <EcosystemVisual type={tab.visual} isActive={isActive} />
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-touch flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Exemplos de sistemas">
            {ecosystemTabs.map((tab, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isActive
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-100'
                  }`}
                  type="button"
                  role="tab"
                  id={`ecosystem-tab-${tab.id}`}
                  aria-controls={`ecosystem-panel-${tab.id}`}
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(index)}
                  key={tab.id}
                >
                  <tab.icon className={`h-4 w-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-sm font-semibold tabular-nums text-slate-500">
              {String(activeIndex + 1).padStart(2, '0')} / {String(ecosystemTabs.length).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" type="button" aria-label="Exemplo anterior" onClick={showPrevious}>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" type="button" aria-label="Próximo exemplo" onClick={showNext}>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
          <Workflow className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          <span>Os dados exibidos são ilustrativos e representam fluxos que podem ser desenvolvidos sob medida.</span>
        </div>
      </div>
    </section>
  );
}
