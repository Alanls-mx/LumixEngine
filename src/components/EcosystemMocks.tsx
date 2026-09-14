import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  Filter,
  Globe2,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  ReceiptText,
  Search,
  Send,
  Settings2,
  ShieldCheck,
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

const journeyPhaseDelays: readonly number[] = [1600, 1700, 1500, 1300, 1600, 1600, 1800];
const finalJourneyPhase: JourneyPhase = 7;

type JourneyPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function EcosystemVisual({ type, isActive }: EcosystemVisualProps) {
  const phase = useJourneyPhase(isActive);
  const operationStep = Math.max(0, phase - 4);
  let customer: ReactNode;
  let operation: ReactNode;

  switch (type) {
    case 'crm':
      customer = <CrmCustomer phase={phase} />;
      operation = <CrmMock step={operationStep} />;
      break;
    case 'scheduling':
      customer = <SchedulingCustomer phase={phase} />;
      operation = <SchedulingMock step={operationStep} />;
      break;
    case 'commerce':
      customer = <CommerceCustomer phase={phase} />;
      operation = <CommerceMock step={operationStep} />;
      break;
    case 'payments':
      customer = <PaymentsCustomer phase={phase} />;
      operation = <PaymentsMock step={operationStep} />;
      break;
    case 'capture':
    default:
      customer = <CaptureCustomer phase={phase} />;
      operation = <CaptureMock step={operationStep} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <JourneyStage phase={phase} type={type} customer={customer} operation={operation} />
    </MotionConfig>
  );
}

function useJourneyPhase(isActive: boolean) {
  const [phase, setPhase] = useState<JourneyPhase>(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setPhase(shouldReduceMotion ? finalJourneyPhase : 0);
    if (!isActive) return;
    if (shouldReduceMotion) return;

    let timeoutId: number;
    const advance = (currentPhase: JourneyPhase) => {
      if (currentPhase >= finalJourneyPhase) return;
      timeoutId = window.setTimeout(() => {
        const nextPhase = (currentPhase + 1) as JourneyPhase;
        setPhase(nextPhase);
        advance(nextPhase);
      }, journeyPhaseDelays[currentPhase]);
    };

    advance(0);
    return () => window.clearTimeout(timeoutId);
  }, [isActive, shouldReduceMotion]);

  return phase;
}

const syncMessages: Record<EcosystemVisualType, { title: string; detail: string }> = {
  capture: { title: 'Lead recebido', detail: 'Identificando origem e enviando os dados para a operação.' },
  crm: { title: 'Oportunidade criada', detail: 'Registrando o escopo da Grupo Ventura no pipeline comercial.' },
  scheduling: { title: 'Reserva criada', detail: 'Bloqueando terça-feira às 09:00 na agenda da Dra. Beatriz.' },
  commerce: { title: 'Pedido #1842 recebido', detail: 'Atualizando pagamento, cliente e estoque em um único registro.' },
  payments: { title: 'Webhook recebido', detail: 'Validando o Pix da Reserva #804 antes da conciliação.' },
};

type JourneyStageProps = {
  phase: JourneyPhase;
  type: EcosystemVisualType;
  customer: ReactNode;
  operation: ReactNode;
};

function JourneyStage({ phase, type, customer, operation }: JourneyStageProps) {
  const customerActive = phase <= 2;
  const syncing = phase === 3;
  const operationActive = phase >= 4;
  const message = syncMessages[type];

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-4 px-1 text-xs font-bold text-slate-400" aria-label={customerActive ? 'Exibindo experiência do cliente' : operationActive ? 'Exibindo operação da empresa' : 'Sincronizando as duas interfaces'}>
        <span className={customerActive ? 'text-emerald-300' : 'text-slate-500'}>Experiência do cliente</span>
        <div className="flex min-w-16 flex-1 items-center" aria-hidden="true">
          <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${customerActive ? 'bg-emerald-400' : 'bg-slate-700'}`} />
          <span className={`h-px flex-1 transition-colors duration-500 ${syncing || operationActive ? 'bg-emerald-400/50' : 'bg-slate-700'}`} />
          <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${operationActive ? 'bg-emerald-400' : 'bg-slate-700'}`} />
        </div>
        <span className={operationActive ? 'text-emerald-300' : 'text-slate-500'}>Operação</span>
      </div>

      <div className="grid grid-cols-1 grid-rows-1">
        <motion.div
          className={`col-start-1 row-start-1 h-full min-w-0 ${customerActive ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'}`}
          animate={{ opacity: customerActive ? 1 : 0, x: customerActive ? 0 : -12, scale: customerActive ? 1 : 0.992 }}
          transition={{ duration: customerActive ? 0.58 : 0.34, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={!customerActive}
          inert={customerActive ? undefined : true}
        >
          {customer}
        </motion.div>

        <motion.div
          className={`col-start-1 row-start-1 h-full min-w-0 ${operationActive ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'}`}
          animate={{ opacity: operationActive ? 1 : 0, x: operationActive ? 0 : 12, scale: operationActive ? 1 : 0.992 }}
          transition={{ duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={!operationActive}
          inert={operationActive ? undefined : true}
        >
          {operation}
        </motion.div>

        <motion.div
          className={`col-start-1 row-start-1 flex h-full min-h-[37rem] items-center justify-center overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b111c] px-6 ${syncing ? 'pointer-events-auto z-20' : 'pointer-events-none z-0'}`}
          animate={{ opacity: syncing ? 1 : 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          aria-hidden={!syncing}
        >
          <div className="w-full max-w-md text-center" aria-live="polite">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <LoaderCircle className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            </div>
            <p className="mt-5 text-lg font-extrabold text-white">{message.title}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-300">{message.detail}</p>
            <div className="mt-6 flex items-center justify-center gap-3 text-xs font-bold text-slate-400">
              <span>Cliente</span><ArrowRight className="h-4 w-4 text-emerald-400" aria-hidden="true" /><span>Sistema</span><ArrowRight className="h-4 w-4 text-emerald-400" aria-hidden="true" /><span>Operação</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

type CustomerFrameProps = {
  children: ReactNode;
  title: string;
  context: string;
  icon: LucideIcon;
};

function CustomerFrame({ children, title, context, icon: Icon }: CustomerFrameProps) {
  return (
    <div className="h-full min-w-0 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b111c] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
      <div className="flex h-12 items-center justify-between border-b border-slate-800 bg-[#0e1624] px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-slate-600" /><span className="h-2.5 w-2.5 rounded-full bg-slate-700" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" /></div>
          <span className="hidden h-4 w-px bg-slate-700 sm:block" />
          <span className="hidden items-center gap-2 text-xs font-semibold text-slate-300 sm:flex"><Globe2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />Experiência pública</span>
        </div>
        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Ambiente seguro</span>
      </div>
      <div className="h-[calc(100%_-_3rem)] min-h-[34rem] bg-[#0d1420] p-3 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><Icon className="h-5 w-5" aria-hidden="true" /></div><div><p className="text-sm font-extrabold text-white">{title}</p><p className="mt-0.5 text-xs text-slate-400">{context}</p></div></div>
          <img src="/assets/lumix-icon-96.webp" alt="" className="h-7 w-7 object-contain" width="28" height="28" />
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? 'sm:col-span-2' : ''}><p className="mb-1.5 text-xs font-bold text-slate-400">{label}</p><div className="min-h-10 rounded-lg border border-slate-700 bg-slate-950/55 px-3 py-2 text-xs font-semibold leading-5 text-slate-100">{value}</div></div>;
}

function CustomerSuccess({ title, detail }: { title: string; detail: string }) {
  return <motion.div className="mt-4 flex min-h-16 items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /><div><p className="text-xs font-extrabold text-emerald-100">{title}</p><p className="mt-1 text-xs leading-5 text-emerald-100/80">{detail}</p></div></motion.div>;
}

function CaptureCustomer({ phase }: { phase: JourneyPhase }) {
  return (
    <CustomerFrame title="Solicite uma demonstração" context="Formulário comercial" icon={MessageSquareText}>
      <div className="mx-auto mt-6 max-w-xl">
        <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><Avatar initials="MC" color="bg-cyan-600" src="/assets/ecosystem/marina.webp" alt="Marina Costa" size="lg" /><div><h4 className="text-xl font-extrabold text-white">Conte o que sua operação precisa.</h4><p className="mt-2 text-sm leading-6 text-slate-400">Os dados seguem com origem e contexto para o time comercial.</p></div></div><Status tone="cyan">Google Ads</Status></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><FormField label="Nome" value="Marina Costa" /><FormField label="Empresa" value="Atlas Comercial" /><FormField label="WhatsApp" value="(11) 98765-2104" /><FormField label="Interesse" value="Sistema comercial" /><FormField wide label="Necessidade" value="Organizar os leads e distribuir cada oportunidade para a equipe." /></div>
        <motion.button className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-extrabold transition-colors ${phase >= 1 ? 'bg-emerald-300 text-slate-950' : 'bg-emerald-400 text-slate-950'}`} animate={{ scale: phase === 1 ? 0.99 : 1 }} type="button"><Send className="h-4 w-4" aria-hidden="true" />{phase >= 1 ? 'Dados enviados' : 'Solicitar demonstração'}</motion.button>
        {phase >= 2 ? <CustomerSuccess title="Solicitação recebida" detail="Marina Costa entrou no fluxo comercial com a origem Google Ads." /> : null}
      </div>
    </CustomerFrame>
  );
}

function CrmCustomer({ phase }: { phase: JourneyPhase }) {
  return (
    <CustomerFrame title="Fale com nosso time" context="Solicitação de orçamento" icon={Building2}>
      <div className="mx-auto mt-6 max-w-xl">
        <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><Avatar initials="RA" color="bg-slate-600" src="/assets/ecosystem/ricardo.webp" alt="Ricardo Almeida" size="lg" /><div><h4 className="text-xl font-extrabold text-white">Vamos entender seu projeto.</h4><p className="mt-2 text-sm leading-6 text-slate-400">Escopo e investimento chegam juntos à oportunidade.</p></div></div><Status>Resposta em 1 dia útil</Status></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><FormField label="Empresa" value="Grupo Ventura" /><FormField label="Contato" value="Ricardo Almeida" /><FormField label="Serviço" value="Sistema de gestão comercial" /><FormField label="Investimento estimado" value="R$ 12.000" /><FormField wide label="Objetivo" value="Centralizar o pipeline, o histórico dos clientes e as próximas ações." /></div>
        <motion.button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 text-xs font-extrabold text-slate-950" animate={{ scale: phase === 1 ? 0.99 : 1 }} type="button"><ArrowRight className="h-4 w-4" aria-hidden="true" />{phase >= 1 ? 'Solicitação enviada' : 'Enviar solicitação'}</motion.button>
        {phase >= 2 ? <CustomerSuccess title="Projeto registrado" detail="Grupo Ventura recebeu o protocolo GV-120 e já pode acompanhar o retorno." /> : null}
      </div>
    </CustomerFrame>
  );
}

function SchedulingCustomer({ phase }: { phase: JourneyPhase }) {
  const selected = phase >= 1;
  return (
    <CustomerFrame title="Clínica Horizonte" context="Agenda da Dra. Beatriz Santos" icon={CalendarDays}>
      <div className="mx-auto mt-5 max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="text-xl font-extrabold text-white">Agende sua avaliação.</h4><p className="mt-1 text-sm text-slate-400">Escolha um horário disponível em tempo real.</p></div><Status>Google Calendar</Status></div>
        <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-slate-800 bg-[#101925] p-4"><p className="text-xs font-bold text-slate-400">SERVIÇO</p><div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3"><div className="flex items-center gap-3"><Avatar initials="BS" color="bg-cyan-700" src="/assets/ecosystem/dentist.webp" alt="Dra. Beatriz Santos" size="lg" /><div className="min-w-0"><p className="truncate text-sm font-bold text-white">Limpeza e avaliação</p><p className="mt-1 truncate text-xs text-slate-300">Dra. Beatriz Santos · 50 min</p></div></div></div><p className="mt-4 text-xs font-bold text-slate-400">CLIENTE</p><p className="mt-2 text-sm font-bold text-white">Gabriel Lima</p><p className="mt-1 text-xs text-slate-400">(11) 99840-2210</p></div>
          <div className="rounded-xl border border-slate-800 bg-[#101925] p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">Terça-feira, 15</p><CalendarCheck2 className="h-4 w-4 text-emerald-300" /></div><div className="mt-4 grid grid-cols-3 gap-2">{['08:00', '09:00', '10:30', '13:30', '15:00', '16:30'].map((time) => <div className={`rounded-lg border px-2 py-2 text-center text-xs font-bold transition-colors duration-500 ${time === '09:00' && selected ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-700 text-slate-300'}`} key={time}>{time}</div>)}</div><button className="mt-4 h-10 w-full rounded-lg bg-emerald-400 text-xs font-extrabold text-slate-950" type="button">{selected ? 'Horário confirmado' : 'Confirmar 09:00'}</button></div>
        </div>
        {phase >= 2 ? <CustomerSuccess title="Agendamento confirmado" detail="Terça-feira, 15, às 09:00 com Dra. Beatriz Santos." /> : null}
      </div>
    </CustomerFrame>
  );
}

const storeProducts = [
  { name: 'Sofá Retrátil Premium', price: 'R$ 2.490', sku: 'SKU SOF-204', image: '/assets/ecosystem/sofa.webp' },
  { name: 'Mesa Aurora 6 lugares', price: 'R$ 1.890', sku: 'SKU MES-118', image: '/assets/ecosystem/table.webp' },
  { name: 'Poltrona Linho Natural', price: 'R$ 890', sku: 'SKU POL-307', image: '/assets/ecosystem/chair.webp' },
] as const;

function CommerceCustomer({ phase }: { phase: JourneyPhase }) {
  return (
    <CustomerFrame title="Casa Aurora" context="Loja virtual" icon={Store}>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div><div className="flex items-end justify-between gap-3"><div><h4 className="text-xl font-extrabold text-white">Móveis para viver bem.</h4><p className="mt-1 text-sm text-slate-400">Entrega calculada no checkout.</p></div><Status tone="cyan">Catálogo online</Status></div><div className="mt-4 grid grid-cols-3 gap-2">{storeProducts.map((product, index) => <motion.div className={`min-w-0 rounded-xl border p-2.5 transition-colors duration-500 ${index === 0 && phase >= 1 ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-slate-800 bg-[#101925]'}`} key={product.sku}><img className="h-20 w-full rounded-lg object-cover" src={product.image} alt={product.name} width="160" height="80" loading="lazy" /><p className="mt-3 line-clamp-2 min-h-10 text-xs font-bold leading-5 text-white">{product.name}</p><p className="mt-2 text-sm font-extrabold text-emerald-300">{product.price}</p></motion.div>)}</div></div>
        <div className="flex min-h-[22rem] flex-col rounded-xl border border-slate-700 bg-[#101925] p-4"><div className="flex items-center justify-between"><p className="text-sm font-extrabold text-white">{phase >= 1 ? 'Checkout seguro' : 'Seu carrinho'}</p><ShoppingBag className="h-4 w-4 text-emerald-300" /></div><div className="mt-4 flex items-center gap-3"><Avatar initials="CM" color="bg-cyan-700" src="/assets/ecosystem/camila.webp" alt="Camila Martins" /><div><p className="text-xs font-bold text-white">Camila Martins</p><p className="mt-0.5 text-xs text-slate-400">Cliente identificado</p></div></div><div className="mt-4 space-y-3"><div className="flex justify-between gap-3 text-xs"><span className="text-slate-300">Sofá Retrátil Premium</span><span className="font-bold text-white">R$ 2.490</span></div><div className="flex justify-between gap-3 text-xs"><span className="text-slate-300">Poltrona Linho Natural</span><span className="font-bold text-white">R$ 890</span></div></div><div className="mt-4 border-t border-slate-800 pt-4"><div className="flex items-center justify-between gap-3 text-xs text-slate-400"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />Entrega</span><span className="text-slate-200">São Paulo, SP</span></div>{phase >= 1 ? <div className="mt-2 flex justify-between text-xs text-slate-400"><span>Pagamento</span><span className="font-bold text-emerald-300">Pix confirmado</span></div> : null}<div className="mt-2 flex justify-between text-sm font-extrabold text-white"><span>Total</span><span>R$ 3.380</span></div></div><button className="mt-auto h-10 rounded-lg bg-emerald-400 text-xs font-extrabold text-slate-950" type="button">{phase >= 1 ? 'Pedido confirmado' : 'Ir para o checkout'}</button></div>
      </div>
      {phase >= 2 ? <CustomerSuccess title="Compra concluída" detail="Pedido #1842 confirmado para Camila Martins. Total: R$ 3.380." /> : null}
    </CustomerFrame>
  );
}

function PaymentsCustomer({ phase }: { phase: JourneyPhase }) {
  const qrVisible = phase >= 1;
  return (
    <CustomerFrame title="Clínica Horizonte" context="Pagamento da reserva" icon={CreditCard}>
      <div className="mx-auto mt-6 grid max-w-2xl gap-4 md:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-slate-800 bg-[#101925] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400">RESERVA #804</p><h4 className="mt-2 text-xl font-extrabold text-white">Avaliação odontológica</h4></div><ReceiptText className="h-6 w-6 text-emerald-300" /></div><div className="mt-5 space-y-3 border-y border-slate-800 py-4 text-xs"><div className="flex justify-between"><span className="text-slate-400">Cliente</span><span className="font-bold text-white">Juliana Paes</span></div><div className="flex justify-between"><span className="text-slate-400">Data</span><span className="font-bold text-white">Quinta, 10:30</span></div><div className="flex justify-between"><span className="text-slate-400">Taxa de reserva</span><span className="font-extrabold text-white">R$ 250,00</span></div></div><button className="mt-5 h-10 w-full rounded-lg bg-emerald-400 text-xs font-extrabold text-slate-950" type="button">{qrVisible ? 'Pix gerado' : 'Pagar com Pix'}</button></div>
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#101925] p-5 text-center">{qrVisible ? <><motion.img className="h-36 w-36 rounded-lg bg-white object-cover p-2" src="/assets/pix-qrcode-240.webp" alt="QR Code Pix ilustrativo da Reserva 804" width="144" height="144" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} /><p className="mt-4 text-xs font-bold text-white">Escaneie ou copie o código Pix</p><p className="mt-1 text-xs text-slate-400">R$ 250,00 · Reserva #804</p></> : <><CircleDollarSign className="h-10 w-10 text-emerald-300" /><p className="mt-4 text-sm font-extrabold text-white">Pagamento seguro</p><p className="mt-2 text-xs leading-5 text-slate-400">A confirmação será vinculada automaticamente à reserva.</p></>}</div>
      </div>
      {phase >= 2 ? <CustomerSuccess title="Pagamento realizado" detail="O Pix de R$ 250,00 foi confirmado para a Reserva #804." /> : null}
    </CustomerFrame>
  );
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
    <div className="h-full min-w-0 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b111c] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
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

function Avatar({ initials, color, src, alt = '', size = 'sm' }: { initials: string; color: string; src?: string; alt?: string; size?: 'sm' | 'lg' }) {
  const dimensions = size === 'lg' ? 'h-10 w-10' : 'h-7 w-7';
  const pixels = size === 'lg' ? 40 : 28;

  if (src) {
    return <img className={`${dimensions} shrink-0 rounded-full object-cover ${color}`} src={src} alt={alt} width={pixels} height={pixels} loading="lazy" />;
  }

  return <span className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${color}`}>{initials}</span>;
}

function CaptureMock({ step }: { step: number }) {
  const events = [
    ['Formulário enviado', 'Marina Costa · Google Ads', 'agora', 0],
    ['Lead identificado', 'Atlas Comercial · (11) 98765-2104', 'agora', 1],
    ['Lead qualificado', 'Interesse: sistema comercial', 'agora', 2],
    ['Responsável definido', 'Lucas Silva · Comercial', 'agora', 2],
    ['Enviado ao CRM', 'Histórico criado automaticamente', 'agora', 3],
  ] as const;

  return (
    <ProductFrame module="Captação" icon={BarChart3} section="Origem e distribuição de oportunidades">
      <div className="grid grid-cols-3 border-b border-slate-800 pb-4">
        <Metric label="Novos registros" value={step >= 1 ? '129' : '128'} detail="últimos 30 dias" />
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
            {events.map(([title, detail, time, threshold], index) => (
              <motion.div
                className="relative flex gap-3 pb-3 last:pb-0"
                animate={{ opacity: threshold <= step ? 1 : 0.46, x: threshold === step ? 3 : 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                key={title}
              >
                {index < events.length - 1 ? <span className="absolute left-3 top-6 h-full w-px bg-slate-700" /> : null}
                <motion.span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${threshold <= step ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900 text-slate-400'}`} animate={{ scale: threshold === step ? [1, 1.08, 1] : 1 }} transition={{ duration: 0.7 }}><Check className="h-3.5 w-3.5" aria-hidden="true" /></motion.span>
                <div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="text-xs font-bold text-slate-100">{title}</p><span className="shrink-0 text-xs text-slate-400">{time}</span></div><p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#101925]">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400"><span>Oportunidade</span><span>Origem</span><span>Status</span></div>
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] items-center px-4 py-3 text-xs"><div className="flex min-w-0 items-center gap-2"><Avatar initials="MC" color="bg-cyan-600" src="/assets/ecosystem/marina.webp" alt="Marina Costa" /><span className="truncate font-bold text-white">Marina Costa</span></div><span className="truncate text-slate-400">Landing page</span><Status>Enviado ao CRM</Status></div>
      </div>
    </ProductFrame>
  );
}

function CrmMock({ step }: { step: number }) {
  const trackedDealStatus = ['Oportunidade recebida', 'Responsável definido', 'Em diagnóstico', 'Próxima ação criada'][step];
  const columns = [
    { title: 'Novos', count: step < 2 ? 9 : 8, cards: [...(step < 2 ? [['Grupo Ventura', 'R$ 12.000', 'LS']] : []), ['Clínica Horizonte', 'R$ 8.500', 'AM'], ['Marmoraria Atlas', 'R$ 5.200', 'RS']] },
    { title: 'Em diagnóstico', count: step >= 2 ? 6 : 5, cards: [...(step >= 2 ? [['Grupo Ventura', 'R$ 12.000', 'LS']] : []), ['Bella Casa', 'R$ 6.800', 'FC']] },
    { title: 'Proposta enviada', count: 3, cards: [['Studio Forma', 'R$ 9.400', 'LS'], ['Odonto Prime', 'R$ 4.900', 'AM']] },
  ];

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

function SchedulingMock({ step }: { step: number }) {
  const scheduleStates = [
    { title: 'Reserva criada', detail: 'Gabriel Lima · terça-feira às 09:00.' },
    { title: 'Google Calendar sincronizado', detail: 'Horário bloqueado para Dra. Beatriz.' },
    { title: 'Confirmação enviada', detail: 'Gabriel recebeu os dados do atendimento.' },
    { title: 'Lembrete programado', detail: 'Envio automático agendado para 24h antes.' },
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
          <Avatar initials="BS" color="bg-cyan-700" src="/assets/ecosystem/dentist.webp" alt="Dra. Beatriz Santos" />
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
                  return (
                    <div className="h-20 border-b border-slate-800 p-1 last:border-b-0 sm:p-1.5" key={row}>
                      {booking ? (
                        <motion.div className={`h-full overflow-hidden rounded-lg border p-1.5 sm:p-2 ${booking.color}`} animate={{ opacity: 1, scale: booking.client === 'Gabriel Lima' && step === 0 ? [0.99, 1.015, 1] : 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
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
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><motion.div className="h-full bg-emerald-400" animate={{ width: step >= 0 ? '78%' : '0%' }} transition={{ duration: 1.1, ease: 'easeOut' }} /></div>
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

function CommerceMock({ step }: { step: number }) {
  const stages = ['Pedido recebido', 'Pagamento confirmado', 'Em separação', 'Pronto para expedição'] as const;
  const orderStatus = ['Pedido recebido', 'Pagamento confirmado', 'Em separação', 'Pronto para expedição'] as const;

  return (
    <ProductFrame module="Comércio" icon={Store} section="Pedidos e catálogo">
      <div className="grid grid-cols-3 border-b border-slate-800 pb-4">
        <Metric label="Pedidos hoje" value={step >= 1 ? '27' : '26'} detail="todos os canais" />
        <Metric label="Em separação" value="8" detail="estoque reservado" accent />
        <Metric label="Carrinhos" value="11" detail="recuperação ativa" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#101925]">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><p className="text-sm font-bold text-white">Catálogo publicado</p><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Store className="h-4 w-4" />Loja + canais</div></div>
          <div className="divide-y divide-slate-800">
            {storeProducts.map((product, index) => (
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3" key={product.sku}>
                <img className={`h-10 w-10 rounded-lg border object-cover ${index === 0 ? 'border-emerald-400/40' : 'border-slate-700'}`} src={product.image} alt="" width="40" height="40" loading="lazy" />
                <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{product.name}</p><p className="mt-1 text-xs text-slate-400">{product.sku} · {index === 0 ? (step >= 1 ? '11 un.' : '12 un.') : index === 1 ? '7 un.' : step >= 1 ? '17 un.' : '18 un.'}</p></div>
                <p className="text-xs font-extrabold tabular-nums text-slate-200">{product.price},00</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#101925] p-4">
          <div className="flex min-h-7 items-center justify-between gap-3"><p className="text-sm font-bold text-white">Pedido #1842</p><div aria-live="polite"><Status tone={step >= 1 ? 'green' : 'cyan'}>{orderStatus[step]}</Status></div></div>
          <div className="mt-4 flex items-center gap-3"><Avatar initials="CM" color="bg-cyan-700" src="/assets/ecosystem/camila.webp" alt="Camila Martins" /><div><p className="text-xs font-bold text-white">Camila Martins</p><p className="text-xs text-slate-400">2 itens · R$ 3.380,00</p></div></div>
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

function PaymentsMock({ step }: { step: number }) {
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
