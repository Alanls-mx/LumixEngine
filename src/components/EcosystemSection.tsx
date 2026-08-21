import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Gauge,
  Globe2,
  MessageCircle,
  ShoppingBag,
  Users,
  Zap,
} from 'lucide-react';

type EcosystemTabId = 'automation' | 'scheduling' | 'payments' | 'team' | 'ecommerce';
type EcosystemVisualType = 'analytics' | 'calendar' | 'payment' | 'team' | 'commerce';

interface EcosystemTab {
  id: EcosystemTabId;
  label: string;
  icon: LucideIcon;
  highlight: string;
  topics: readonly string[];
  visual: EcosystemVisualType;
}

const ecosystemTabs = [
  {
    id: 'automation',
    label: 'Captação e dados',
    icon: Zap,
    highlight: 'O cliente chega pelo site, loja, formulário ou WhatsApp e a informação segue para o lugar certo.',
    topics: [
      'Formulários, páginas e canais de contato coletam dados sem depender de cópia manual.',
      'Eventos do site e campanhas ajudam a entender de onde vêm as oportunidades.',
      'A equipe recebe um resumo com origem, interesse e próximo passo recomendado.',
    ],
    visual: 'analytics',
  },
  {
    id: 'scheduling',
    label: 'Agenda organizada',
    icon: CalendarDays,
    highlight: 'Horários, profissionais e confirmações entram no mesmo processo operacional.',
    topics: [
      'Google Calendar sincronizado com horários e profissionais disponíveis.',
      'Lembretes e confirmações reduzem faltas e reagendamentos manuais.',
      'Sinal via Pix pode bloquear o horário quando a regra do negócio exigir.',
    ],
    visual: 'calendar',
  },
  {
    id: 'payments',
    label: 'Pix e checkout',
    icon: CreditCard,
    highlight: 'Cobranças e confirmações deixam de depender de conferência manual.',
    topics: [
      'Chave Pix, QR Code ou link de checkout entram no fluxo quando necessário.',
      'Webhook confirma pagamento e atualiza status no painel ou sistema usado pela equipe.',
      'Taxas, pedidos e reservas ficam ligados ao cliente e ao histórico comercial.',
    ],
    visual: 'payment',
  },
  {
    id: 'team',
    label: 'Gestão e CRM',
    icon: Users,
    highlight: 'A equipe acompanha solicitações, clientes e tarefas sem depender de planilhas paralelas.',
    topics: [
      'Registros distribuídos por responsável, etapa, prioridade ou tipo de demanda.',
      'Histórico do cliente junto da próxima ação recomendada.',
      'Indicadores da operação aparecem antes que o acúmulo vire problema.',
    ],
    visual: 'team',
  },
  {
    id: 'ecommerce',
    label: 'Loja virtual',
    icon: ShoppingBag,
    highlight: 'Produtos, pedidos, pagamento e recuperação de carrinho ficam conectados à venda.',
    topics: [
      'Landing page ou loja rápida com catálogo, oferta e checkout objetivo.',
      'Pedidos podem seguir para WhatsApp, CRM, planilha, ERP ou gateway de pagamento.',
      'Carrinhos abandonados entram em recuperação com produto, valor e contexto.',
    ],
    visual: 'commerce',
  },
] satisfies readonly EcosystemTab[];

const liveLoopIntervalMs = 3500;
const ecosystemAutoplayIntervalMs = 12000;

export function EcosystemSection() {
  const [activeSystemIndex, setActiveSystemIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSystemIndex((currentIndex) => (currentIndex + 1) % ecosystemTabs.length);
    }, ecosystemAutoplayIntervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      id="ecossistema"
      className="bg-night px-3 py-12 min-[360px]:px-5 md:px-8 md:py-16"
      aria-labelledby="ecosystem-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="ecosystem-title" className="text-[clamp(1.875rem,7vw,3rem)] font-bold tracking-normal text-white md:text-5xl">
            A tecnologia entra onde a operação precisa de controle
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Site, loja, sistema interno, agenda, Pix, planilhas e CRM podem trabalhar juntos sem obrigar sua equipe a repetir informação.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 grid-rows-1">
          {ecosystemTabs.map((tab, index) => {
            const isActive = index === activeSystemIndex;

            return (
              <div
                className={`col-start-1 row-start-1 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center ${
                  isActive
                    ? 'opacity-100 z-10 pointer-events-auto transition-opacity duration-500'
                    : 'opacity-0 z-0 pointer-events-none transition-opacity duration-500'
                }`}
                id={`ecosystem-panel-${tab.id}`}
                role={isActive ? 'region' : undefined}
                aria-hidden={!isActive}
                aria-label={isActive ? `Sistema em destaque: ${tab.label}` : undefined}
                inert={isActive ? undefined : true}
                key={tab.id}
              >
                <div className="max-w-2xl">
                  <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-300">{tab.label}</p>
                  <h3 className="mt-4 text-[clamp(1.5rem,5vw,2.25rem)] font-extrabold tracking-normal text-white md:text-4xl">
                    {tab.highlight}
                  </h3>

                  <ul className="mt-8 space-y-5">
                    {tab.topics.map((topic) => (
                      <li className="flex gap-3 text-base leading-7 text-slate-300" key={topic}>
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <EcosystemVisual tab={tab} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type EcosystemVisualProps = {
  tab: EcosystemTab;
};

function EcosystemVisual({ tab }: EcosystemVisualProps) {
  switch (tab.visual) {
    case 'calendar':
      return <CalendarVisual />;
    case 'team':
      return <TeamDashboardVisual />;
    case 'commerce':
      return <CommerceVisual />;
    case 'payment':
      return <PaymentVisual />;
    case 'analytics':
    default:
      return <AutomationDashboardVisual />;
  }
}

const imageAssets = {
  doctor:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80',
  lucas:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  fernanda:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  sofa:
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=560&q=80',
  dining:
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=560&q=80',
} as const;

function AutomationDashboardVisual() {
  const eventFeed = [
    {
      time: '09:41',
      title: 'Novo formulário recebido',
      detail: 'Origem identificada: página de serviços',
      tone: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    },
    {
      time: '09:40',
      title: 'Registro enviado ao CRM',
      detail: 'Responsável e próxima ação definidos',
      tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    },
    {
      time: '09:38',
      title: 'Planilha atualizada',
      detail: 'Dados salvos sem digitação manual',
      tone: 'border-slate-700 bg-white/5 text-slate-100',
    },
  ];

  return (
    <VisualShell>
      <div className="flex h-full min-h-[22rem] flex-col rounded-xl border border-slate-800 bg-night/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge icon={Zap}>Dados em movimento</Badge>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-extrabold text-emerald-200">
            Ativo agora
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MetricCard label="Entrada do cliente" value="identificada" supporting="Site, loja, formulário ou WhatsApp" />
          <MetricCard label="Próxima ação" value="definida" supporting="CRM, planilha ou equipe responsável" />
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-white">Evolução das solicitações</p>
            <span className="text-xs font-extrabold text-emerald-300">rastreável</span>
          </div>
          <MiniLineChart />
        </div>

        <div className="mt-5 space-y-3">
          {eventFeed.map((event) => (
            <div
              className={`rounded-lg border px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 ${event.tone}`}
              key={`${event.time}-${event.title}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-white">{event.title}</p>
                  <p className="mt-1 text-xs font-bold opacity-80">{event.detail}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-extrabold tabular-nums">
                  {event.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualShell>
  );
}

function CalendarVisual() {
  const animationRef = useRef<HTMLDivElement>(null);
  const isAnimationInView = useInView(animationRef, { margin: '-80px' });
  const [isScheduleConfirmed, setIsScheduleConfirmed] = useState(false);
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const appointments = [
    {
      dayIndex: 1,
      slotIndex: 0,
      time: '09:00',
      label: 'Limpeza & Avaliação',
      detail: 'Gabriel Lima - R$ 250,00',
      confirmedClassName: 'bg-emerald-500/90',
    },
    {
      dayIndex: 2,
      slotIndex: 2,
      time: '11:30',
      label: 'Clareamento Laser',
      detail: 'Amanda Rocha - R$ 780,00',
      confirmedClassName: 'bg-emerald-400/90',
    },
    {
      dayIndex: 3,
      slotIndex: 1,
      time: '14:00',
      label: 'Consulta de Retorno',
      detail: 'Carlos Eduardo',
      confirmedClassName: 'bg-teal-500/90',
    },
  ];
  const appointmentStatus = isScheduleConfirmed ? 'Confirmado no fluxo' : 'Pendente';
  const appointmentStatusClass = isScheduleConfirmed
    ? 'border-emerald-200/30 bg-white/10 text-emerald-50'
    : 'border-amber-100/30 bg-amber-200/20 text-amber-50';
  const appointmentFallbackClass = isScheduleConfirmed ? '' : 'bg-amber-500/80';
  const scheduleNotification = isScheduleConfirmed
    ? 'Lembrete enviado há 15 min. Cliente confirmou participação.'
    : 'Novo agendamento recebido pelo site. Aguardando confirmação automática do cliente.';

  useEffect(() => {
    if (!isAnimationInView) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIsScheduleConfirmed((currentValue) => !currentValue);
    }, liveLoopIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isAnimationInView]);

  return (
    <VisualShell>
      <div
        ref={animationRef}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-night/70 p-3"
      >
        <div className="flex min-w-0 items-center gap-3">
          <img
            className="h-11 w-11 rounded-full object-cover"
            src={imageAssets.doctor}
            alt="Dra. Beatriz Santos"
            width={44}
            height={44}
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-white">Dra. Beatriz Santos</p>
            <p className="text-xs font-bold text-slate-300">Odontologia</p>
          </div>
        </div>
        <Badge icon={CalendarDays}>Agenda sincronizada</Badge>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-night/70">
        <div className="grid min-w-0 grid-cols-5 gap-1.5 p-2 sm:gap-2 sm:p-3">
          {days.map((day, dayIndex) => (
            <div className="text-center" key={day}>
              <p className="mb-2 text-xs font-extrabold text-slate-400">{day}</p>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((slotIndex) => {
                  const appointment = appointments.find(
                    (item) => item.dayIndex === dayIndex && item.slotIndex === slotIndex,
                  );

                  return appointment ? (
                    <motion.div
                      className={`flex h-full min-h-20 overflow-hidden rounded-lg px-1.5 py-2 text-left text-[10px] font-extrabold leading-3 text-white shadow-[0_14px_32px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-1 hover:ring-1 hover:ring-white/40 sm:min-h-24 sm:rounded-xl sm:px-2 sm:text-xs sm:leading-4 ${isScheduleConfirmed ? appointment.confirmedClassName : appointmentFallbackClass}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, scale: isScheduleConfirmed ? 1 : 0.985 }}
                      transition={{ delay: slotIndex * 0.04, duration: 0.2 }}
                      key={slotIndex}
                    >
                      <div className="flex h-full min-w-0 flex-1 flex-col justify-between gap-2 overflow-hidden">
                        <div className="min-w-0">
                          <span className="block truncate">{appointment.time}</span>
                          <span className="block truncate">{appointment.label}</span>
                          <span className="mt-1 block truncate font-bold opacity-85">{appointment.detail}</span>
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            className={`block max-w-full truncate rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold leading-none ${appointmentStatusClass}`}
                            key={appointmentStatus}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                          >
                            {appointmentStatus}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                ) : (
                  <div className="h-full min-h-20 overflow-hidden rounded-lg border border-white/5 bg-white/[0.03] sm:min-h-24 sm:rounded-xl" key={slotIndex} />
                );
              })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-emerald-300/10 px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.14, duration: 0.24 }}
      >
        <span className="relative flex h-5 w-5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/35" />
          <MessageCircle className="relative h-5 w-5 text-emerald-300" aria-hidden="true" />
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            className="text-sm font-extrabold text-emerald-100"
            key={scheduleNotification}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {scheduleNotification}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </VisualShell>
  );
}

function TeamDashboardVisual() {
  const agents = [
    {
      name: 'Lucas Silva',
      role: 'Comercial',
      image: imageAssets.lucas,
      metric: 'Leads priorizados',
      result: 'Próximas ações visíveis',
    },
    {
      name: 'Fernanda Costa',
      role: 'Operação',
      image: imageAssets.fernanda,
      metric: 'Tarefas do dia',
      result: 'Histórico atualizado',
    },
  ];
  const columns = [
    {
      title: 'Novos Leads',
      items: ['Bancada Quartzito - R$ 5.200', 'Implante Dental - R$ 3.800'],
      tone: 'border-emerald-400/30 bg-emerald-400/10',
    },
    {
      title: 'Em Fechamento',
      items: ['Projeto Cozinha - R$ 12.000'],
      tone: 'border-slate-700 bg-white/5',
    },
    {
      title: 'Fechados',
      items: ['Reserva Odonto - R$ 250', 'Combo Delivery - R$ 89,90'],
      tone: 'border-emerald-300/30 bg-emerald-300/10',
    },
  ];

  return (
    <VisualShell>
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label="Fila de trabalho" value="priorizada" supporting="Responsável e etapa definidos" />
        <MetricCard label="Histórico do cliente" value="centralizado" supporting="Sem procurar informação em várias telas" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {agents.map((agent) => (
          <div
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-night/70 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.07]"
            key={agent.name}
          >
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={agent.image}
              alt={agent.name}
              width={48}
              height={48}
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-white">{agent.name}</p>
              <p className="text-xs font-bold text-emerald-200">{agent.role}</p>
              <p className="mt-1 text-xs font-bold text-slate-300">
                {agent.metric} | {agent.result}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {columns.map((column) => (
          <div
            className="rounded-xl border border-slate-800 bg-night/70 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30"
            key={column.title}
          >
            <p className="mb-3 text-xs font-extrabold uppercase text-slate-300">{column.title}</p>
            <div className="space-y-2">
              {column.items.map((item) => (
                <div className={`rounded-xl border px-3 py-2 text-xs font-bold text-white ${column.tone}`} key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </VisualShell>
  );
}

function CommerceVisual() {
  const products = [
    {
      name: 'Kit Sofá Retrátil Premium',
      price: 'R$ 2.490,00',
      image: imageAssets.sofa,
    },
    {
      name: 'Mesa de Jantar Madeira Nobre',
      price: 'R$ 1.890,00',
      image: imageAssets.dining,
    },
  ];

  return (
    <VisualShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge icon={Gauge}>Loja conectada</Badge>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-extrabold text-emerald-200">
          Checkout e estoque
        </span>
      </div>

      <div className="mt-5 grid items-end gap-4 lg:grid-cols-[1fr_0.58fr]">
        <div className="rounded-xl border border-white/5 bg-[#f8fafc] p-4 text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="text-sm font-extrabold">Lumix Store</p>
              <p className="text-xs font-bold text-slate-400">Landing + checkout rápido</p>
            </div>
            <Globe2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300"
                key={product.name}
              >
                <img
                  className="mb-3 h-20 w-full rounded-xl object-cover"
                  src={product.image}
                  alt={product.name}
                  width={180}
                  height={80}
                  loading="lazy"
                />
                <p className="min-h-10 text-xs font-extrabold leading-5">{product.name}</p>
                <p className="mt-1 text-sm font-extrabold text-[#008069]">{product.price}</p>
              </div>
            ))}
          </div>

          <motion.button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#00A884] px-4 py-3 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(0,168,132,0.28)]"
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            type="button"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Finalizar pedido
          </motion.button>
        </div>

        <div className="mx-auto w-full max-w-[12rem] rounded-[2rem] border border-white/10 bg-[#101720] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
          <div className="rounded-[1.5rem] bg-[#efeae2] p-3">
            <div className="rounded-xl bg-[#1F2C34] px-3 py-3 text-white">
              <p className="text-xs font-extrabold">Catálogo conectado</p>
              <p className="text-xs font-bold text-emerald-300">Carrinho conectado</p>
            </div>
            <div className="mt-3 rounded-xl bg-white p-3">
              <img
                className="h-14 w-full rounded-xl object-cover"
                src={imageAssets.sofa}
                alt="Carrinho com sofá retrátil premium"
                width={160}
                height={56}
                loading="lazy"
              />
              <p className="mt-2 text-xs font-extrabold text-gray-900">Kit Sofá Retrátil</p>
              <p className="text-xs font-bold text-gray-600">2 itens no carrinho</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="mt-4 rounded-xl border border-slate-800 bg-emerald-300/10 px-4 py-3 text-sm font-extrabold text-emerald-100 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.22 }}
      >
        Carrinho abandonado entrou na fila de recuperação com produto, valor e canal de origem.
      </motion.div>
    </VisualShell>
  );
}

function PaymentVisual() {
  const animationRef = useRef<HTMLDivElement>(null);
  const isAnimationInView = useInView(animationRef, { margin: '-80px' });
  const [paymentCycle, setPaymentCycle] = useState({
    webhookReceived: false,
    confirmedPayments: 0,
  });
  const totalReceived = 3840 + paymentCycle.confirmedPayments * 150;
  const transactionsCount = 12 + paymentCycle.confirmedPayments;
  const formattedTotal = totalReceived.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const webhookStatus = paymentCycle.webhookReceived ? 'Pix Recebido' : 'Aguardando Webhook';
  const webhookStatusClass = paymentCycle.webhookReceived
    ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
    : 'border-amber-200/25 bg-amber-200/10 text-amber-100';
  const webhookSummary = paymentCycle.webhookReceived
    ? 'Status atualizado no sistema da operação'
    : 'Integração aguardando confirmação do banco';

  useEffect(() => {
    if (!isAnimationInView) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPaymentCycle((currentCycle) => {
        if (currentCycle.webhookReceived) {
          return {
            ...currentCycle,
            webhookReceived: false,
          };
        }

        return {
          webhookReceived: true,
          confirmedPayments: currentCycle.confirmedPayments + 1,
        };
      });
    }, liveLoopIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isAnimationInView]);

  return (
    <VisualShell>
      <div ref={animationRef} className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-night/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.07]">
          <p className="text-xs font-extrabold uppercase text-slate-400">Total confirmado no painel</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              className="mt-2 text-2xl font-extrabold text-white"
              key={formattedTotal}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {formattedTotal}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-xs font-bold text-emerald-300">{transactionsCount} pagamentos conciliados</p>
        </div>
        <MetricCard label="Status financeiro" value="automático" supporting="Baixa via webhook quando disponível" />
      </div>

      <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-slate-800 bg-night/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold ${webhookStatusClass}`}
              key={webhookStatus}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              {webhookStatus}
            </motion.span>
          </AnimatePresence>
          <img
            className="mx-auto mt-5 h-32 w-32 rounded-xl bg-white object-cover p-2 shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
            src="/assets/pix-qrcode-240.webp"
            alt="QR Code Pix para confirmação de pagamento"
            width={240}
            height={240}
            loading="lazy"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-emerald-300/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30">
          <div className="rounded-xl border border-slate-800 bg-night/80 p-4">
            <p className="text-sm font-extrabold text-emerald-200">Pagamento recebido</p>
            <p className="mt-2 text-2xl font-extrabold text-white">R$ 150,00</p>
            <p className="mt-1 text-xs font-bold text-slate-300">Sinal, pedido ou reserva confirmado</p>
            <p className="mt-4 text-sm font-bold text-slate-200">Cliente vinculado ao registro da operação</p>
          </div>
          <p className="mt-4 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-extrabold text-emerald-200">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={webhookSummary}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {webhookSummary}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
      </div>
    </VisualShell>
  );
}

type VisualShellProps = {
  children: ReactNode;
};

function VisualShell({ children }: VisualShellProps) {
  return (
    <div className="min-w-0 rounded-xl border border-white/5 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 min-[360px]:p-4 md:p-8">
      {children}
    </div>
  );
}

type BadgeProps = {
  children: ReactNode;
  icon: LucideIcon;
};

function Badge({ children, icon: Icon }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-extrabold text-emerald-100">
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </span>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  supporting?: string;
};

function MetricCard({ label, value, supporting }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-night/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.07]">
      <p className="text-xs font-extrabold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
      {supporting ? <p className="mt-1 text-xs font-bold text-emerald-300">{supporting}</p> : null}
    </div>
  );
}

function MiniLineChart() {
  const linePath = 'M8 78 C 48 70, 58 42, 96 48 S 152 70, 190 44 260 18, 352 22';
  const areaPath = `${linePath} L352 96 L8 96 Z`;
  const points = [
    { cx: 8, cy: 78 },
    { cx: 96, cy: 48 },
    { cx: 190, cy: 44 },
    { cx: 352, cy: 22 },
  ] as const;

  return (
    <svg
      className="mt-4 h-24 w-full overflow-visible"
      viewBox="0 0 360 96"
      role="img"
      aria-labelledby="conversion-chart-title"
    >
      <title id="conversion-chart-title">Gráfico de solicitações acompanhadas</title>
      <defs>
        <linearGradient id="conversionLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="55%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <path
        d={linePath}
        fill="none"
        stroke="url(#conversionLine)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path d={areaPath} fill="rgba(16,185,129,0.12)" />
      {points.map((point) => (
        <circle
          className="fill-emerald-300"
          cx={point.cx}
          cy={point.cy}
          r="4"
          key={`${point.cx}-${point.cy}`}
        />
      ))}
    </svg>
  );
}
