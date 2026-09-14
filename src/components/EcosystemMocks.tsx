import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  Filter,
  LayoutDashboard,
  MessageSquareText,
  MoreHorizontal,
  Package,
  Search,
  Settings2,
  ShoppingBag,
  Store,
  Users,
  Webhook,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export type EcosystemVisualType = 'capture' | 'crm' | 'scheduling' | 'commerce' | 'payments';

type EcosystemVisualProps = {
  type: EcosystemVisualType;
  isActive: boolean;
};

const liveUpdateMs = 4000;

export function EcosystemVisual({ type, isActive }: EcosystemVisualProps) {
  let visual: ReactNode;

  switch (type) {
    case 'crm': visual = <CrmMock isActive={isActive} />; break;
    case 'scheduling': visual = <SchedulingMock isActive={isActive} />; break;
    case 'commerce': visual = <CommerceMock isActive={isActive} />; break;
    case 'payments': visual = <PaymentsMock isActive={isActive} />; break;
    case 'capture':
    default: visual = <CaptureMock isActive={isActive} />;
  }

  return <MotionConfig reducedMotion="user">{visual}</MotionConfig>;
}

function useLiveStep(isActive: boolean, steps: number, delay = liveUpdateMs) {
  const [step, setStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isActive) return;
    setStep(shouldReduceMotion ? steps - 1 : 0);
    if (shouldReduceMotion) return;

    const intervalId = window.setInterval(() => setStep((current) => (current + 1) % steps), delay);
    return () => window.clearInterval(intervalId);
  }, [delay, isActive, shouldReduceMotion, steps]);

  return step;
}

type ProductFrameProps = {
  children: ReactNode;
  module: string;
  icon: LucideIcon;
  section: string;
};

function ProductFrame({ children, module, icon: Icon, section }: ProductFrameProps) {
  const nav = [
    { label: 'Visão geral', icon: LayoutDashboard },
    { label: 'Operação', icon: Workflow },
    { label: 'Clientes', icon: Users },
    { label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b111c] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
      <div className="flex h-12 items-center justify-between border-b border-slate-800 bg-[#0e1624] px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="hidden h-4 w-px bg-slate-700 sm:block" />
          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-300 sm:flex">
            <Icon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            {module}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 text-xs font-semibold text-emerald-300 min-[420px]:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Ambiente operacional
          </span>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" type="button" aria-label="Notificações">
            <Bell className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-xs font-extrabold text-slate-950">LS</div>
        </div>
      </div>

      <div className="grid min-h-[34rem] grid-cols-1 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-800 bg-[#0a1019] p-3 sm:flex sm:flex-col">
          <div className="mb-5 flex items-center gap-2 px-2 text-sm font-extrabold text-white">
            <img src="/assets/lumix-icon-96.webp" alt="" className="h-6 w-6 object-contain" width="24" height="24" />
            Lumix OS
          </div>
          <nav className="space-y-1" aria-label="Navegação do sistema demonstrativo">
            {nav.map((item, index) => (
              <div className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold ${index === 1 ? 'bg-emerald-400/10 text-emerald-200' : 'text-slate-400'}`} key={item.label}>
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-400"><Settings2 className="h-4 w-4" aria-hidden="true" />Configurações</div>
          </div>
        </aside>

        <main className="min-w-0 overflow-hidden bg-[#0d1420]">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
            <div><p className="text-xs font-semibold text-slate-400">{module}</p><h4 className="text-sm font-extrabold text-white sm:text-base">{section}</h4></div>
            <div className="flex items-center gap-2">
              <button className="hidden h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-300 md:flex" type="button"><Filter className="h-4 w-4" aria-hidden="true" />Filtrar</button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400" type="button" aria-label="Mais ações"><MoreHorizontal className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
          <div className="p-3 sm:p-4 md:p-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

type MetricProps = { label: string; value: string; detail: string; accent?: boolean };

function Metric({ label, value, detail, accent = false }: MetricProps) {
  return (
    <div className="min-w-0 border-r border-slate-800 px-3 py-1 first:pl-0 last:border-r-0 last:pr-0 sm:px-4">
      <p className="truncate text-xs font-semibold text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-lg font-extrabold tabular-nums ${accent ? 'text-emerald-300' : 'text-white'}`}>{value}</p>
      <p className="mt-0.5 hidden text-xs leading-5 text-slate-400 md:block">{detail}</p>
    </div>
  );
}

function Status({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'amber' | 'slate' | 'cyan' }) {
  const styles = {
    green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    slate: 'border-slate-700 bg-slate-800/70 text-slate-300',
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  };
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${color}`}>{initials}</span>;
}

function CaptureMock({ isActive }: { isActive: boolean }) {
  const step = useLiveStep(isActive, 3);
  const events = [
    ['Formulário enviado', 'Landing page / Google Ads', 'agora'],
    ['Lead qualificado', 'Interesse: sistema comercial', 'há 1 min'],
    ['Responsável definido', 'Lucas Silva / Comercial', 'há 2 min'],
  ] as const;

  return (
    <ProductFrame module="Captação" icon={BarChart3} section="Origem e distribuição de oportunidades">
      <div className="grid grid-cols-3 border-b border-slate-800 pb-4">
        <Metric label="Novos registros" value="128" detail="últimos 30 dias" />
        <Metric label="Qualificados" value="42" detail="com dados completos" accent />
        <Metric label="Em atendimento" value="17" detail="responsável definido" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 rounded-xl border border-slate-800 bg-[#101925] p-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-white">Entradas por canal</p><p className="mt-1 text-xs text-slate-400">Registros recebidos e identificados</p></div><Status tone="cyan">Tempo real</Status></div>
          <div className="mt-6 flex h-36 items-end gap-2 sm:gap-3">
            {[38, 54, 47, 72, 61, 84, 76, 92, 68, 88, 96, 82].map((height, index) => (
              <motion.div className="min-w-0 flex-1 rounded-t bg-emerald-400/20" animate={{ height: `${step === index % 3 ? Math.min(height + 8, 100) : height}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} key={`${height}-${index}`}><div className="h-1 rounded-t bg-emerald-400" /></motion.div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs font-semibold text-slate-400"><span>Site</span><span>Campanhas</span><span>Indicação</span><span>WhatsApp</span></div>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800 bg-[#101925] p-4">
          <p className="text-sm font-bold text-white">Fluxo do último lead</p>
          <div className="mt-4 space-y-1">
            {events.map(([title, detail, time], index) => (
              <motion.div
                className="relative flex gap-3 pb-4 last:pb-0"
                animate={{ opacity: index <= step ? 1 : 0.46, x: index === step ? 3 : 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                key={title}
              >
                {index < events.length - 1 ? <span className="absolute left-3 top-6 h-full w-px bg-slate-700" /> : null}
                <motion.span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${index <= step ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900 text-slate-400'}`} animate={{ scale: index === step ? [1, 1.08, 1] : 1 }} transition={{ duration: 0.7 }}><Check className="h-3.5 w-3.5" aria-hidden="true" /></motion.span>
                <div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="text-xs font-bold text-slate-100">{title}</p><span className="shrink-0 text-xs text-slate-400">{time}</span></div><p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#101925]">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400"><span>Oportunidade</span><span>Origem</span><span>Status</span></div>
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] items-center px-4 py-3 text-xs"><div className="flex min-w-0 items-center gap-2"><Avatar initials="MC" color="bg-cyan-600" /><span className="truncate font-bold text-white">Marina Costa</span></div><span className="truncate text-slate-400">Landing page</span><Status>Enviado ao CRM</Status></div>
      </div>
    </ProductFrame>
  );
}

function CrmMock({ isActive }: { isActive: boolean }) {
  const step = useLiveStep(isActive, 3, 4000);
  const trackedDealStatus = ['Lead recebido', 'Diagnóstico atualizado', 'Proposta pronta'][step];
  const columns = [
    { title: 'Novos', count: 8, cards: [['Clínica Horizonte', 'R$ 8.500', 'AM'], ['Marmoraria Atlas', 'R$ 5.200', 'RS']] },
    { title: 'Em diagnóstico', count: 5, cards: [['Grupo Ventura', 'R$ 12.000', 'LS'], ['Bella Casa', 'R$ 6.800', 'FC']] },
    { title: 'Proposta enviada', count: 3, cards: [['Studio Forma', 'R$ 9.400', 'LS'], ['Odonto Prime', 'R$ 4.900', 'AM']] },
  ] as const;

  return (
    <ProductFrame module="Gestão comercial" icon={Users} section="Pipeline de oportunidades">
      <div className="grid grid-cols-3 border-b border-slate-800 pb-4">
        <Metric label="Pipeline aberto" value="R$ 46,8 mil" detail="16 oportunidades" />
        <Metric label="Próximas ações" value="9" detail="para hoje" accent />
        <Metric label="Conversão" value="31%" detail="últimos 30 dias" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><div className="h-9 rounded-lg border border-slate-700 bg-slate-950/50 pl-9 pr-3 text-xs leading-9 text-slate-400">Buscar cliente ou negócio</div></div>
        <button className="h-9 rounded-lg bg-emerald-400 px-3 text-xs font-extrabold text-slate-950" type="button">Nova oportunidade</button>
      </div>
      <div className="overflow-touch mt-4 grid auto-cols-[minmax(13rem,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-3 md:overflow-visible md:pb-0">
        {columns.map((column) => (
          <div className="min-w-0 rounded-xl border border-slate-800 bg-[#101925] p-3" key={column.title}>
            <div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-200">{column.title}</p><span className="text-xs tabular-nums text-slate-400">{column.count}</span></div>
            <div className="mt-3 space-y-2">
              {column.cards.map(([name, value, owner]) => {
                const trackedDeal = name === 'Grupo Ventura';
                return (
                  <motion.div className={`rounded-lg border bg-[#0c1420] p-3 ${trackedDeal ? 'border-emerald-400/50' : 'border-slate-800'}`} animate={{ y: trackedDeal ? -2 : 0, boxShadow: trackedDeal ? '0 12px 30px rgba(16,185,129,0.08)' : '0 0 0 rgba(0,0,0,0)' }} transition={{ duration: 0.8, ease: 'easeOut' }} key={name}>
                    <div className="flex items-start justify-between gap-2"><p className="text-xs font-bold text-white">{name}</p><MoreHorizontal className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /></div>
                    <p className="mt-2 text-sm font-extrabold tabular-nums text-slate-200">{value}</p>
                    {trackedDeal ? (
                      <div className="mt-2 min-h-5" aria-live="polite">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.p className="text-xs font-semibold text-emerald-300" key={trackedDealStatus} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.6 }}>{trackedDealStatus}</motion.p>
                        </AnimatePresence>
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />Hoje, 15:30</span><Avatar initials={owner} color={owner === 'LS' ? 'bg-emerald-600' : 'bg-slate-600'} /></div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#101925] px-4 py-3"><div className="min-w-0"><p className="text-xs font-bold text-white">Próxima ação: revisar escopo do Grupo Ventura</p><p className="mt-1 text-xs leading-5 text-slate-400">Histórico, anexos e conversa disponíveis no registro</p></div><Status tone="amber">Hoje</Status></div>
    </ProductFrame>
  );
}

function SchedulingMock({ isActive }: { isActive: boolean }) {
  const step = useLiveStep(isActive, 3);
  const scheduleStates = [
    { title: 'Horário selecionado', detail: '09:00 reservado temporariamente.' },
    { title: 'Lembrete programado', detail: 'Confirmação enviada ao cliente.' },
    { title: 'Presença confirmada', detail: 'Gabriel confirmou o atendimento.' },
  ] as const;
  const bookings = [
    { day: 1, row: 0, time: '09:00', client: 'Gabriel Lima', service: 'Avaliação', color: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100' },
    { day: 2, row: 1, time: '11:30', client: 'Amanda Rocha', service: 'Clareamento', color: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-100' },
    { day: 3, row: 2, time: '14:00', client: 'Carlos Eduardo', service: 'Retorno', color: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100' },
  ] as const;
  const days = ['Seg 14', 'Ter 15', 'Qua 16', 'Qui 17', 'Sex 18'];

  return (
    <ProductFrame module="Agenda" icon={CalendarDays} section="Semana de atendimento">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Avatar initials="BS" color="bg-cyan-700" />
          <div><p className="text-xs font-bold text-white">Dra. Beatriz Santos</p><p className="text-xs text-slate-400">Odontologia</p></div>
        </div>
        <div className="flex flex-wrap gap-2"><Status>Google Calendar sincronizado</Status><Status tone="slate">Semana</Status></div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_12rem]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#101925]">
          <div className="grid grid-cols-5 border-b border-slate-800">
            {days.map((day) => <div className="border-r border-slate-800 px-1 py-2 text-center text-xs font-semibold text-slate-400 last:border-r-0 sm:px-2" key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-5">
            {days.map((day, dayIndex) => (
              <div className="border-r border-slate-800 last:border-r-0" key={day}>
                {[0, 1, 2, 3].map((row) => {
                  const booking = bookings.find((item) => item.day === dayIndex && item.row === row);
                  const bookingIndex = booking ? bookings.indexOf(booking) : -1;
                  return (
                    <div className="h-20 border-b border-slate-800 p-1 last:border-b-0 sm:p-1.5" key={row}>
                      {booking ? (
                        <motion.div className={`h-full overflow-hidden rounded-lg border p-1.5 sm:p-2 ${booking.color}`} animate={{ opacity: step >= bookingIndex ? 1 : 0.62, scale: step === bookingIndex ? [0.99, 1.015, 1] : 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                          <p className="truncate text-xs font-extrabold">{booking.time}</p>
                          <p className="mt-1 truncate text-xs font-bold">{booking.client}</p>
                          <p className="hidden truncate text-xs opacity-70 sm:block">{booking.service}</p>
                        </motion.div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl border border-slate-800 bg-[#101925] p-3">
            <p className="text-xs font-semibold text-slate-400">Ocupação da semana</p><p className="mt-1 text-xl font-extrabold text-white">78%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><motion.div className="h-full bg-emerald-400" animate={{ width: isActive ? '78%' : '0%' }} transition={{ duration: 1.1, ease: 'easeOut' }} /></div>
          </div>
          <div className="min-h-32 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3" aria-live="polite">
            <MessageSquareText className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={scheduleStates[step].title} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.65, ease: 'easeOut' }}>
                <p className="mt-3 text-xs font-bold text-emerald-100">{scheduleStates[step].title}</p>
                <p className="mt-1 text-xs leading-5 text-emerald-100/80">{scheduleStates[step].detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#101925] p-3">
            <p className="text-xs font-bold text-white">Próximo lembrete</p><p className="mt-1 text-xs text-slate-400">Hoje, 18:00</p><div className="mt-3"><Status tone="cyan">24h antes</Status></div>
          </div>
        </div>
      </div>
    </ProductFrame>
  );
}

function CommerceMock({ isActive }: { isActive: boolean }) {
  const step = useLiveStep(isActive, 3, 4000);
  const stages = ['Carrinho criado', 'Checkout iniciado', 'Pedido confirmado'] as const;
  const orderStatus = ['Carrinho criado', 'Em checkout', 'Pedido confirmado'] as const;

  return (
    <ProductFrame module="Comércio" icon={Store} section="Pedidos e catálogo">
      <div className="grid grid-cols-3 border-b border-slate-800 pb-4">
        <Metric label="Pedidos hoje" value="26" detail="todos os canais" />
        <Metric label="Em separação" value="8" detail="estoque reservado" accent />
        <Metric label="Carrinhos" value="11" detail="recuperação ativa" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#101925]">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><p className="text-sm font-bold text-white">Catálogo publicado</p><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Store className="h-4 w-4" />Loja + canais</div></div>
          <div className="divide-y divide-slate-800">
            {[
              ['Sofá Retrátil Premium', 'SKU SOF-204', 'R$ 2.490,00', '12 un.'],
              ['Mesa Aurora 6 lugares', 'SKU MES-118', 'R$ 1.890,00', '7 un.'],
              ['Poltrona Linho Natural', 'SKU POL-307', 'R$ 890,00', '18 un.'],
            ].map(([name, sku, price, stock], index) => (
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3" key={sku}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${index === 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}><Package className="h-5 w-5" /></div>
                <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{name}</p><p className="mt-1 text-xs text-slate-400">{sku} · {stock}</p></div>
                <p className="text-xs font-extrabold tabular-nums text-slate-200">{price}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#101925] p-4">
          <div className="flex min-h-7 items-center justify-between gap-3"><p className="text-sm font-bold text-white">Pedido #1842</p><div aria-live="polite"><Status tone={step === 2 ? 'green' : 'cyan'}>{orderStatus[step]}</Status></div></div>
          <div className="mt-4 flex items-center gap-3"><Avatar initials="CM" color="bg-cyan-700" /><div><p className="text-xs font-bold text-white">Camila Martins</p><p className="text-xs text-slate-400">2 itens · R$ 3.380,00</p></div></div>
          <div className="mt-5 space-y-3">
            {stages.map((stage, index) => (
              <div className="flex items-center gap-3" key={stage}>
                <motion.div className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-700 ${index <= step ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-700 text-slate-500'}`} animate={{ scale: index === step ? [1, 1.07, 1] : 1 }} transition={{ duration: 0.7, ease: 'easeOut' }}><Check className="h-3.5 w-3.5" /></motion.div>
                <span className={`text-xs font-semibold transition-colors duration-700 ${index <= step ? 'text-slate-100' : 'text-slate-500'}`}>{stage}</span>
              </div>
            ))}
          </div>
          <button className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 text-xs font-bold text-slate-200" type="button"><ShoppingBag className="h-4 w-4" />Abrir pedido</button>
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div className="mt-4 flex min-h-16 items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3" key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.65, ease: 'easeOut' }} aria-live="polite">
          <div className="min-w-0"><p className="text-xs font-bold text-emerald-100">{stages[step]}</p><p className="mt-1 text-xs leading-5 text-emerald-100/80">Estoque, cliente e canal atualizados no mesmo registro.</p></div><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
        </motion.div>
      </AnimatePresence>
    </ProductFrame>
  );
}

function PaymentsMock({ isActive }: { isActive: boolean }) {
  const step = useLiveStep(isActive, 4, 3000);
  const webhookReceived = step >= 1;
  const paid = step >= 2;
  const reconciled = step >= 3;
  const paymentStatus = ['Cobrança gerada', 'Webhook recebido', 'Pagamento confirmado', 'Conciliado'] as const;
  const events = [
    { title: 'Cobrança gerada', detail: 'Cliente: Juliana Paes · Reserva #804', icon: CircleDollarSign },
    { title: 'Webhook recebido', detail: 'Transação e38a9... validada pelo gateway', icon: Webhook },
    { title: 'Pagamento confirmado', detail: 'R$ 250,00 liberados para a reserva', icon: CheckCircle2 },
    { title: 'Registro conciliado', detail: 'Reserva confirmada e histórico atualizado', icon: Database },
  ];

  return (
    <ProductFrame module="Financeiro" icon={CreditCard} section="Cobranças e conciliação">
      <div className="grid grid-cols-3 border-b border-slate-800 pb-4">
        <Metric label="Recebido hoje" value={paid ? 'R$ 4.090' : 'R$ 3.840'} detail="pagamentos confirmados" accent />
        <Metric label="A conciliar" value={reconciled ? '0' : '1'} detail="atualização automática" />
        <Metric label="Confirmação" value="2,4s" detail="tempo do webhook" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-xl border border-slate-800 bg-[#101925] p-4">
          <div className="flex min-h-7 items-center justify-between gap-3"><p className="text-sm font-bold text-white">Cobrança #PX-2048</p><div aria-live="polite"><Status tone={paid ? 'green' : webhookReceived ? 'cyan' : 'amber'}>{paymentStatus[step]}</Status></div></div>
          <img className="mx-auto mt-5 h-32 w-32 rounded-lg bg-white object-cover p-2" src="/assets/pix-qrcode-240.webp" alt="QR Code Pix ilustrativo" width="128" height="128" loading="lazy" />
          <div className="mt-4 border-t border-slate-800 pt-4"><div className="flex justify-between text-xs"><span className="text-slate-400">Valor</span><span className="font-extrabold text-white">R$ 250,00</span></div><div className="mt-2 flex justify-between text-xs"><span className="text-slate-400">Vínculo</span><span className="font-semibold text-slate-300">Reserva #804</span></div></div>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800 bg-[#101925] p-4">
          <div className="flex items-center justify-between"><p className="text-sm font-bold text-white">Linha do pagamento</p><Webhook className="h-4 w-4 text-slate-400" /></div>
          <div className="mt-5 space-y-1">
            {events.map((event, index) => (
              <div className="relative flex gap-3 pb-5 last:pb-0" key={event.title}>
                {index < events.length - 1 ? <span className={`absolute left-4 top-8 h-full w-px transition-colors duration-700 ${index < step ? 'bg-emerald-400/50' : 'bg-slate-700'}`} /> : null}
                <motion.div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-700 ${index <= step ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-500'}`} animate={{ scale: index === step ? [1, 1.06, 1] : 1 }} transition={{ duration: 0.7, ease: 'easeOut' }}><event.icon className="h-4 w-4" /></motion.div>
                <div className="min-w-0"><p className={`text-xs font-bold transition-colors duration-700 ${index <= step ? 'text-white' : 'text-slate-500'}`}>{event.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{event.detail}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#101925]">
        <div className="grid grid-cols-[1fr_0.7fr_0.8fr] border-b border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400"><span>Cliente</span><span>Valor</span><span>Status</span></div>
        <div className="grid grid-cols-[1fr_0.7fr_0.8fr] items-center px-4 py-3 text-xs"><span className="truncate font-bold text-white">Juliana Paes</span><span className="tabular-nums text-slate-300">R$ 250,00</span><div aria-live="polite"><Status tone={reconciled || paid ? 'green' : webhookReceived ? 'cyan' : 'amber'}>{reconciled ? 'Conciliado' : paid ? 'Confirmado' : webhookReceived ? 'Validando' : 'Pendente'}</Status></div></div>
      </div>
    </ProductFrame>
  );
}
