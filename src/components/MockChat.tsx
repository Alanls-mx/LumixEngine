import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Copy,
  CreditCard,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { resolveApiUrl } from '../lib/apiBaseUrl';
import { getScenarioSimulation } from '../services/api';
import type { ChatMessage, ScenarioId, ScenarioResponse } from '../types/scenario';

const messageMotion = {
  initial: { opacity: 0, scale: 0.82, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 6 },
};

const playbackDelayMultiplier = 1.7;
const scrollOffset = 220;

type NicheOption = {
  id: ScenarioId;
  label: string;
};

type SegmentProfile = {
  name: string;
  status: string;
  avatarUrl: string;
};

type SegmentInsight = {
  delay: string;
  lostLeads: string;
  scheduling: string;
  pricing?: string;
  team?: string;
  payment?: string;
  demo: string;
  booking: string;
  consultant: string;
};

const segmentProfiles: Record<ScenarioId, SegmentProfile> = {
  padrao: {
    name: 'LumixEngine',
    status: 'Online agora',
    avatarUrl: '/Icone.png',
  },
  clinica: {
    name: 'Clínica Lumix Saúde',
    status: 'Online agora',
    avatarUrl:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=82',
  },
  marmoraria: {
    name: 'Lumix Design & Pedras',
    status: 'Online agora',
    avatarUrl:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=320&q=82',
  },
  barbearia: {
    name: 'Lumix Barber & Spa',
    status: 'Online agora',
    avatarUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=320&q=82',
  },
  ecommerce: {
    name: 'Lumix Store',
    status: 'Online agora',
    avatarUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=320&q=82',
  },
  restaurante: {
    name: 'Bella Pizza',
    status: 'Online agora',
    avatarUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=320&q=82',
  },
  imobiliaria: {
    name: 'Prime Lar Imóveis',
    status: 'Online agora',
    avatarUrl:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=320&q=82',
  },
};

const segmentInsights: Record<ScenarioId, SegmentInsight> = {
  padrao: {
    delay:
      'No fluxo padrão, o primeiro contato é registrado, classificado e direcionado para o próximo passo sem depender de conferência manual.',
    lostLeads:
      'Quando o visitante fica sem retorno, a solução registra origem, intenção e prioridade para a equipe não perder contexto.',
    scheduling:
      'A agenda pode ficar conectada ao site, formulário ou chat com horários disponíveis, lembretes e confirmação automática.',
    pricing:
      'Quando o cliente só pergunta preço, o fluxo coleta contexto antes de responder: necessidade, prazo, quantidade e melhor caminho comercial.',
    team:
      'Quando a equipe está sobrecarregada, o sistema organiza solicitações repetidas, separa urgências e mostra nome, necessidade e próximo passo.',
    payment:
      'Para evitar reserva ou pedido sem confirmação, a solução pode gerar Pix, confirmar via webhook e atualizar agenda, pedido ou CRM.',
    demo: 'Posso carregar uma simulação por segmento com avatar, nome e jornada operacional personalizada.',
    booking: 'Para uma proposta inicial, mapeamos segmento, volume de solicitações, canais atuais e ferramentas usadas pela empresa.',
    consultant: 'Um consultor recebe o resumo do processo, origem do lead e principal gargalo antes de chamar você.',
  },
  clinica: {
    delay:
      'Na clínica, a automação responde dúvidas de convênio, horários e procedimentos antes que o paciente procure outro consultório.',
    lostLeads:
      'Cada paciente interessado vira lead com procedimento, urgência e origem rastreados para a recepção priorizar o retorno.',
    scheduling:
      'A agenda oferece horários reais, envia lembretes 24h e 2h antes e cobra sinal via Pix para reduzir faltas.',
    demo: 'Vou simular uma limpeza com confirmação de horário, coleta de dados e taxa de reserva pelo WhatsApp.',
    booking: 'A agenda da clínica pode liberar horários por profissional e confirmar o paciente automaticamente.',
    consultant: 'O consultor recebe volume de mensagens, taxa de no-show e principais procedimentos procurados.',
  },
  marmoraria: {
    delay:
      'Na marmoraria, o bot coleta medida, material e prazo enquanto o cliente ainda está com a obra na cabeça.',
    lostLeads:
      'Orçamentos de alto ticket entram no funil com valor estimado, ambiente da obra e prioridade de visita técnica.',
    scheduling:
      'A visita técnica pode ser agendada no chat com lembrete automático e confirmação do endereço.',
    demo: 'Vou simular orçamento de bancada com estimativa, visita técnica e lead salvo no CRM.',
    booking: 'A medição fina pode ser marcada automaticamente com equipe, endereço e janela de atendimento.',
    consultant: 'O consultor recebe material desejado, medidas iniciais e ticket estimado antes do contato.',
  },
  barbearia: {
    delay:
      'Na barbearia, o cliente vê horários livres por profissional e agenda corte, barba ou estética sem esperar resposta manual.',
    lostLeads:
      'Quem pergunta preço ou disponibilidade fica salvo para campanha de retorno em horários de menor movimento.',
    scheduling:
      'O sistema confirma horário, envia lembrete e permite reagendamento para proteger a agenda dos barbeiros.',
    demo: 'Vou simular um corte com escolha de horário, profissional e taxa de reserva via Pix.',
    booking: 'A agenda pode separar serviços por duração, profissional e pacote para evitar encaixes errados.',
    consultant: 'O consultor recebe serviços mais procurados, horários ociosos e taxa de comparecimento.',
  },
  ecommerce: {
    delay:
      'No e-commerce, o bot recupera carrinho, responde dúvidas de frete e leva o cliente direto para o checkout.',
    lostLeads:
      'Carrinhos abandonados recebem retorno automático com produto, valor e contexto da compra.',
    scheduling:
      'Para varejo com retirada ou instalação, o WhatsApp agenda entrega, retirada ou atendimento pós-venda.',
    demo: 'Vou simular recuperação de carrinho com catálogo, checkout e evento de compra rastreado.',
    booking: 'O atendimento pode reservar retirada, instalação ou entrega conforme estoque e região.',
    consultant: 'O consultor recebe produtos mais abandonados, origem das vendas e taxa de conversão por canal.',
  },
  restaurante: {
    delay:
      'No delivery, respostas imediatas mostram cardápio, taxa de entrega e formas de pagamento sem travar o pedido.',
    lostLeads:
      'Pedidos incompletos entram em recuperação automática com item escolhido, bairro e horário do abandono.',
    scheduling:
      'Reservas e pedidos programados podem ser confirmados no chat com lembretes e status da cozinha.',
    demo: 'Vou simular pedido com cardápio, endereço e envio automático para a cozinha.',
    booking: 'A reserva pode confirmar mesa, horário e quantidade de pessoas sem atendimento manual.',
    consultant: 'O consultor recebe volume de pedidos, bairros atendidos e gargalos de cardápio.',
  },
  imobiliaria: {
    delay:
      'Na imobiliária, o bot responde valor, localização e perfil do imóvel antes de acionar o corretor certo.',
    lostLeads:
      'O lead entra no CRM com imóvel de interesse, faixa de entrada e preferência por visita ou tour virtual.',
    scheduling:
      'Visitas presenciais e tours virtuais podem ser marcados com lembrete e confirmação automática.',
    demo: 'Vou simular qualificação de comprador, tour virtual e envio do lead quente ao corretor.',
    booking: 'A visita pode ser distribuída por corretor, região e disponibilidade da agenda.',
    consultant: 'O consultor recebe imóvel buscado, orçamento e prontidão de compra antes do contato.',
  },
};

const nicheOptions = [
  { id: 'clinica', label: 'Clínica / Saúde' },
  { id: 'restaurante', label: 'Restaurante / Delivery' },
  { id: 'imobiliaria', label: 'Imobiliária / Corretores' },
  { id: 'marmoraria', label: 'Marmoraria / Construção' },
  { id: 'barbearia', label: 'Barbearia / Estética' },
  { id: 'ecommerce', label: 'E-commerce / Varejo' },
  { id: 'padrao', label: 'Reiniciar Demonstrativo' },
] satisfies readonly NicheOption[];

const continuationOptions = ['Ver Demonstração', 'Simular Agenda', 'Simular Cobrança Pix', 'Falar com Consultor'] as const;

const segmentOptionMap: Record<string, ScenarioId> = {
  'Clínica / Saúde': 'clinica',
  'Restaurante / Delivery': 'restaurante',
  'Imobiliária / Corretores': 'imobiliaria',
  'Marmoraria / Construção': 'marmoraria',
  'Barbearia / Estética': 'barbearia',
  'E-commerce / Varejo': 'ecommerce',
};

export const MockChat = memo(function MockChat() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('padrao');
  const [replayToken, setReplayToken] = useState(0);
  const [scenario, setScenario] = useState<ScenarioResponse | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFlowComplete, setIsFlowComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [resolvedOptionMessageIds, setResolvedOptionMessageIds] = useState<Set<number>>(() => new Set());
  const [scrollState, setScrollState] = useState({ canScrollUp: false, canScrollDown: false });
  const phoneRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const interactiveTimersRef = useRef<number[]>([]);
  const playbackTimersRef = useRef<number[]>([]);
  const nextInteractiveMessageIdRef = useRef(1000);
  const isInView = useInView(phoneRef, { once: true, amount: 0.42, margin: '-80px 0px -80px 0px' });

  const clearInteractiveTimers = useCallback(() => {
    interactiveTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    interactiveTimersRef.current = [];
  }, []);

  const clearPlaybackTimers = useCallback(() => {
    playbackTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    playbackTimersRef.current = [];
  }, []);

  const createInteractiveMessage = useCallback(
    (message: Omit<ChatMessage, 'id' | 'delay'> & { id?: number; delay?: number }): ChatMessage => ({
      ...message,
      id: message.id ?? nextInteractiveMessageIdRef.current++,
      delay: message.delay ?? 0,
    }),
    [],
  );

  const updateScrollState = useCallback(() => {
    const chatBody = chatBodyRef.current;

    if (!chatBody) {
      return;
    }

    const threshold = 8;
    const canScrollDown = chatBody.scrollTop + chatBody.clientHeight < chatBody.scrollHeight - threshold;
    const nextScrollState = {
      canScrollUp: chatBody.scrollTop > threshold,
      canScrollDown,
    };

    setScrollState((currentScrollState) => {
      if (
        currentScrollState.canScrollUp === nextScrollState.canScrollUp &&
        currentScrollState.canScrollDown === nextScrollState.canScrollDown
      ) {
        return currentScrollState;
      }

      return nextScrollState;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    const chatBody = chatBodyRef.current;
    const messagesEnd = messagesEndRef.current;

    if (!chatBody) {
      return;
    }

    chatBody.scrollTo({
      top: messagesEnd?.offsetTop ?? chatBody.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  const scrollChat = useCallback((direction: 'up' | 'down') => {
    const chatBody = chatBodyRef.current;

    if (!chatBody) {
      return;
    }

    chatBody.scrollBy({
      top: direction === 'up' ? -scrollOffset : scrollOffset,
      behavior: 'smooth',
    });
  }, []);

  const startScenario = useCallback((scenarioId: ScenarioId) => {
    clearInteractiveTimers();
    clearPlaybackTimers();
    setIsFlowComplete(false);
    setIsTyping(false);
    setVisibleMessages([]);
    setErrorMessage(null);
    setCopiedMessageId(null);
    setResolvedOptionMessageIds(new Set());
    setActiveScenarioId(scenarioId);
    setReplayToken((currentReplayToken) => currentReplayToken + 1);
  }, [clearInteractiveTimers, clearPlaybackTimers]);

  useEffect(() => {
    if (isInView) {
      setHasStarted(true);
    }
  }, [isInView]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setIsTyping(false);
    setIsFlowComplete(false);
    setVisibleMessages([]);
    setErrorMessage(null);
    setCopiedMessageId(null);
    setResolvedOptionMessageIds(new Set());

    getScenarioSimulation(activeScenarioId, controller.signal)
      .then(setScenario)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setScenario(null);
        setErrorMessage('Não foi possível carregar a simulação agora. Verifique se a API LumixEngine está online.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [activeScenarioId, hasStarted, replayToken]);

  useEffect(() => {
    if (!hasStarted || isLoading || errorMessage || !scenario || scenario.flow.length === 0) {
      return;
    }

    const timers: number[] = [];
    let elapsedTime = 0;

    clearInteractiveTimers();
    clearPlaybackTimers();
    setVisibleMessages([]);
    setIsTyping(false);
    setIsFlowComplete(false);
    setResolvedOptionMessageIds(new Set());

    scenario.flow.forEach((message) => {
      const messageDelay = message.delay * playbackDelayMultiplier;

      elapsedTime += messageDelay;

      if (message.sender === 'bot' && message.status === 'typing') {
        const typingAt = Math.max(0, elapsedTime - Math.min(messageDelay, 1400));

        timers.push(
          window.setTimeout(() => {
            setIsTyping(true);
          }, typingAt),
        );
      }

      timers.push(
        window.setTimeout(() => {
          setVisibleMessages((currentMessages) => [...currentMessages, message]);

          if (message.sender === 'bot') {
            setIsTyping(false);
          }
        }, elapsedTime),
      );
    });

    timers.push(
      window.setTimeout(() => {
        setIsTyping(false);
        setIsFlowComplete(scenario.flow[scenario.flow.length - 1]?.type !== 'options');
      }, elapsedTime + 650),
    );

    playbackTimersRef.current = timers;

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      playbackTimersRef.current = [];
    };
  }, [clearInteractiveTimers, clearPlaybackTimers, errorMessage, hasStarted, isLoading, scenario]);

  const buildInteractiveBotResponse = useCallback(
    (selectedOption: string): ChatMessage[] => {
      const segmentInsight = segmentInsights[activeScenarioId];
      const selectedSegmentId = segmentOptionMap[selectedOption];

      if (selectedSegmentId) {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text: `Perfeito. Vou carregar a simulação para ${segmentProfiles[selectedSegmentId].name}.`,
          }),
        ];
      }

      if (selectedOption === 'Entrada de clientes' || selectedOption === 'Demora para responder') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text: segmentInsight.delay,
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Qual próximo passo você quer testar?',
            options: [...continuationOptions],
          }),
        ];
      }

      if (selectedOption === 'Leads sem retorno') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text: segmentInsight.lostLeads,
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Quer aprofundar em qual caminho?',
            options: [...continuationOptions],
          }),
        ];
      }

      if (selectedOption === 'Agenda desorganizada') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text: segmentInsight.scheduling,
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Escolha uma continuação para o teste:',
            options: [...continuationOptions],
          }),
        ];
      }

      if (selectedOption === 'Pedidos e orçamentos' || selectedOption === 'Cliente só pergunta preço') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text:
              segmentInsight.pricing ??
              'O fluxo responde preço com contexto: entende necessidade, filtra urgência e evita jogar um valor solto antes de qualificar a oportunidade.',
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Como você quer continuar essa simulação?',
            options: [...continuationOptions],
          }),
        ];
      }

      if (selectedOption === 'Equipe sobrecarregada') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text:
              segmentInsight.team ??
              'A solução absorve solicitações repetidas, separa prioridades e entrega para a equipe apenas o que já tem contexto e próximo passo.',
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Quer ver isso em qual formato?',
            options: ['Ver Demonstração', 'Falar com Consultor', ...Object.keys(segmentOptionMap)],
          }),
        ];
      }

      if (
        selectedOption === 'Pagamentos e confirmação' ||
        selectedOption === 'Cobrar sinal via Pix' ||
        selectedOption === 'Simular Cobrança Pix'
      ) {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text:
              segmentInsight.payment ??
              'A solução gera a cobrança, acompanha o pagamento e confirma pedido, reserva ou agendamento quando o webhook retorna o Pix pago.',
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'checkout',
            text: 'Simulação: taxa de reserva de R$ 30,00 gerada para confirmar o próximo horário.',
            pixKey:
              '00020126360014BR.GOV.BCB.PIX0114lumixengine520400005303986540530.005802BR5911LUMIXENGINE6009SAO PAULO62140510TESTE-PIX6304B2C3',
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'system_event',
            text: 'Pagamento confirmado via webhook e lead atualizado no CRM.',
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Quer testar outra etapa da operação?',
            options: [...continuationOptions],
          }),
        ];
      }

      if (selectedOption === 'Ver Demonstração') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text: segmentInsight.demo,
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Escolha o segmento para personalizar a demonstração:',
            options: Object.keys(segmentOptionMap),
          }),
        ];
      }

      if (selectedOption === 'Simular Agenda' || selectedOption === 'Agendar Horário') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text: segmentInsight.booking,
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'calendar',
            text: 'Tenho estes horários livres para simular a confirmação automática:',
            options: ['Hoje às 16:00', 'Amanhã às 11:00', 'Quinta às 14:30'],
          }),
        ];
      }

      if (selectedOption === 'Falar com Consultor') {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'text',
            text: segmentInsight.consultant,
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Deseja ver essa solução aplicada em algum segmento?',
            options: Object.keys(segmentOptionMap),
          }),
        ];
      }

      if (selectedOption.includes('às')) {
        return [
          createInteractiveMessage({
            sender: 'bot',
            type: 'system_event',
            text: `Horário ${selectedOption} confirmado no calendário da operação.`,
          }),
          createInteractiveMessage({
            sender: 'bot',
            type: 'options',
            text: 'Quer testar outro caminho?',
            options: [...continuationOptions],
          }),
        ];
      }

      return [
        createInteractiveMessage({
          sender: 'bot',
          type: 'text',
          text: 'Entendido. Esse ponto entra no mapeamento da solução e fica salvo para a equipe continuar com contexto.',
        }),
        createInteractiveMessage({
          sender: 'bot',
          type: 'options',
          text: 'Como deseja continuar?',
          options: [...continuationOptions],
        }),
      ];
    },
    [activeScenarioId, createInteractiveMessage],
  );

  const handleOptionSelect = useCallback(
    (message: ChatMessage, selectedOption: string) => {
      if (resolvedOptionMessageIds.has(message.id)) {
        return;
      }

      clearInteractiveTimers();
      clearPlaybackTimers();
      setResolvedOptionMessageIds((currentMessageIds) => new Set(currentMessageIds).add(message.id));
      setIsFlowComplete(false);
      setVisibleMessages((currentMessages) => [
        ...currentMessages,
        createInteractiveMessage({
          sender: 'client',
          type: 'text',
          text: selectedOption,
        }),
      ]);
      setIsTyping(true);

      const selectedSegmentId = segmentOptionMap[selectedOption];
      const responseTimer = window.setTimeout(() => {
        const botMessages = buildInteractiveBotResponse(selectedOption);

        setVisibleMessages((currentMessages) => [...currentMessages, ...botMessages]);
        setIsTyping(false);

        if (selectedSegmentId) {
          const scenarioTimer = window.setTimeout(() => {
            startScenario(selectedSegmentId);
          }, 850);

          interactiveTimersRef.current.push(scenarioTimer);
        }
      }, 800);

      interactiveTimersRef.current.push(responseTimer);
    },
    [
      buildInteractiveBotResponse,
      clearInteractiveTimers,
      clearPlaybackTimers,
      createInteractiveMessage,
      resolvedOptionMessageIds,
      startScenario,
    ],
  );

  useEffect(() => {
    scrollToBottom();

    const stateTimer = window.setTimeout(() => {
      updateScrollState();
    }, 380);

    return () => window.clearTimeout(stateTimer);
  }, [visibleMessages, isTyping, isFlowComplete, isLoading, errorMessage, scrollToBottom, updateScrollState]);

  useEffect(() => {
    const chatBody = chatBodyRef.current;

    if (!chatBody) {
      return;
    }

    updateScrollState();
    chatBody.addEventListener('scroll', updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(chatBody);

    return () => {
      chatBody.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    return () => {
      clearInteractiveTimers();
      clearPlaybackTimers();
    };
  }, [clearInteractiveTimers, clearPlaybackTimers]);

  const activeProfile = segmentProfiles[activeScenarioId] ?? scenario?.businessProfile;
  const profileName = activeProfile.name;
  const profileStatus = isTyping ? 'Digitando...' : activeProfile.status;
  const chatSessionKey = `${activeScenarioId}-${replayToken}`;

  return (
    <motion.div
      ref={phoneRef}
      className="relative mx-auto h-[604px] max-h-[604px] w-full max-w-[23rem] overflow-visible rounded-[40px] border border-slate-800 bg-[#05070A] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.45),0_0_54px_rgba(16,185,129,0.10)] sm:h-[624px] sm:max-h-[624px]"
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      animate={hasStarted ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      aria-label={`Simulação de conversa de WhatsApp para ${profileName}`}
    >
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#efeae2] shadow-[inset_0_0_44px_rgba(255,255,255,0.045)]">
        <div className="absolute left-1/2 top-2 z-20 h-1.5 w-20 -translate-x-1/2 rounded-full bg-black/75 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
        <div className="absolute right-[6.7rem] top-2 z-20 h-1.5 w-1.5 rounded-full bg-slate-700" />

        <header className="relative z-10 flex-shrink-0 bg-[#1F2C34] px-4 pb-3 pt-7">
          <div className="flex items-center gap-3">
            <img
              src={activeProfile.avatarUrl}
              alt={profileName}
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              loading="eager"
              decoding="async"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-white">{profileName}</p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-400">{profileStatus}</p>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                type="button"
                aria-label="Reiniciar teste do simulador"
                title="Reiniciar Teste"
                onClick={() => startScenario(activeScenarioId)}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </button>
              <Video className="h-4 w-4" aria-hidden="true" />
              <Phone className="h-4 w-4" aria-hidden="true" />
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </header>

        <div
          ref={chatBodyRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-touch scroll-smooth bg-[#efeae2] bg-[radial-gradient(circle_at_20%_20%,rgba(17,24,39,0.055)_0_1px,transparent_1px),radial-gradient(circle_at_70%_40%,rgba(17,24,39,0.04)_0_1px,transparent_1px)] bg-[length:22px_22px,30px_30px] p-4 pr-7 [scrollbar-color:rgba(31,44,52,0.36)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/40 [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <motion.div
            className="flex min-h-full flex-col justify-end gap-3"
            key={chatSessionKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {isLoading ? <LoadingSkeleton key="loading" /> : null}

              {errorMessage ? <ErrorBubble message={errorMessage} key="error" /> : null}

              {!isLoading &&
                !errorMessage &&
                visibleMessages.map((message) => (
                  <ChatMessageBubble
                    message={message}
                    copiedMessageId={copiedMessageId}
                    isOptionsDisabled={resolvedOptionMessageIds.has(message.id)}
                    onCopyPix={setCopiedMessageId}
                    onOptionSelect={handleOptionSelect}
                    key={`${scenario?.nichoId}-${message.id}`}
                  />
                ))}

              {!isLoading && !errorMessage && isTyping ? <TypingBubble key="typing" /> : null}

              {!isLoading && !errorMessage && isFlowComplete ? (
                <NicheSelectorBubble
                  activeScenarioId={activeScenarioId}
                  options={nicheOptions}
                  onSelect={startScenario}
                  key="niche-selector"
                />
              ) : null}
            </AnimatePresence>

            <div ref={messagesEndRef} aria-hidden="true" />
          </motion.div>
        </div>

        <footer className="relative z-10 flex-shrink-0 bg-[#1F2C34] px-3 py-3">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-extrabold text-emerald-300">
            Fluxo digital ativo
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-[#202C33] px-4 py-3 text-sm font-medium text-slate-400">
              <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">Digite uma mensagem</span>
              <Mic className="h-4 w-4 shrink-0" aria-hidden="true" />
            </div>
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00A884] text-white shadow-[0_10px_30px_rgba(0,168,132,0.22)]"
              type="button"
              aria-label="Enviar mensagem simulada"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </footer>
      </div>

      <div className="pointer-events-none absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        <ScrollControlButton direction="up" isVisible={scrollState.canScrollUp} onClick={() => scrollChat('up')} />
        <ScrollControlButton direction="down" isVisible={scrollState.canScrollDown} onClick={() => scrollChat('down')} />
      </div>
    </motion.div>
  );
});

type ChatMessageBubbleProps = {
  message: ChatMessage;
  copiedMessageId: number | null;
  isOptionsDisabled: boolean;
  onCopyPix: (messageId: number | null) => void;
  onOptionSelect: (message: ChatMessage, selectedOption: string) => void;
};

type NicheSelectorBubbleProps = {
  activeScenarioId: ScenarioId;
  options: readonly NicheOption[];
  onSelect: (scenarioId: ScenarioId) => void;
};

function NicheSelectorBubble({ activeScenarioId, options, onSelect }: NicheSelectorBubbleProps) {
  const displayedOptions: NicheOption[] =
    activeScenarioId === 'padrao'
      ? [...options]
      : [
          { id: 'padrao', label: 'Ver outro segmento' },
          ...options.filter((option) => option.id !== 'padrao' && option.id !== activeScenarioId),
        ];

  return (
    <motion.div
      className="flex justify-start"
      initial={messageMotion.initial}
      animate={messageMotion.animate}
      exit={messageMotion.exit}
      transition={{ duration: 0.26, ease: 'easeOut' }}
      layout
    >
      <div className="w-[88%] rounded-2xl rounded-bl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-900 shadow-[0_6px_18px_rgba(15,23,42,0.10)]">
        <p className="font-semibold">
          Quer ver como uma solução digital funciona na prática no seu segmento? Escolha uma opção abaixo:
        </p>

        <div className="mt-3 grid gap-2">
          {displayedOptions.map((option) => (
            <button
              className="flex w-full items-center justify-center rounded-xl border border-[#00A884]/35 bg-[#f7fffb] px-3 py-2 text-sm font-extrabold text-[#008069] shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition hover:bg-[#e7fce3] focus:outline-none focus:ring-2 focus:ring-[#00A884]/40"
              type="button"
              onClick={() => onSelect(option.id)}
              key={`${option.id}-${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-end gap-1 text-xs font-medium text-gray-500">
          <span>19:42</span>
        </div>
      </div>
    </motion.div>
  );
}

type ScrollControlButtonProps = {
  direction: 'up' | 'down';
  isVisible: boolean;
  onClick: () => void;
};

function ScrollControlButton({ direction, isVisible, onClick }: ScrollControlButtonProps) {
  const Icon = direction === 'up' ? ChevronUp : ChevronDown;
  const label = direction === 'up' ? 'Subir conversa do WhatsApp' : 'Descer conversa do WhatsApp';

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.button
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-300/70 bg-white/90 text-[#1F2C34] shadow-[0_12px_34px_rgba(15,23,42,0.18)] backdrop-blur transition hover:border-[#00A884]/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A884]/50"
          type="button"
          aria-label={label}
          onClick={onClick}
          initial={{ opacity: 0, scale: 0.9, y: direction === 'up' ? -6 : 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: direction === 'up' ? -6 : 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

function ChatMessageBubble({
  message,
  copiedMessageId,
  isOptionsDisabled,
  onCopyPix,
  onOptionSelect,
}: ChatMessageBubbleProps) {
  if (message.type === 'system_event') {
    return <SystemEvent text={message.text} />;
  }

  const isClient = message.sender === 'client';
  const hasInteractivePayload = message.type === 'options' || message.type === 'calendar' || message.type === 'checkout';

  return (
    <motion.div
      className={isClient ? 'flex justify-end' : 'flex justify-start'}
      initial={messageMotion.initial}
      animate={messageMotion.animate}
      exit={messageMotion.exit}
      transition={{ duration: 0.26, ease: 'easeOut' }}
      layout
    >
      <div
        className={[
          'max-w-[84%] text-sm leading-6 text-gray-900 shadow-[0_6px_18px_rgba(15,23,42,0.10)]',
          isClient
            ? 'rounded-2xl rounded-br bg-[#d9fdd3] px-3.5 py-2.5'
            : 'rounded-2xl rounded-bl border border-slate-200 bg-white px-3.5 py-2.5',
          hasInteractivePayload ? 'w-[84%]' : '',
        ].join(' ')}
      >
        <p>{message.text}</p>

        {message.type === 'options' || message.type === 'calendar' ? (
          <QuickReplyList
            message={message}
            isDisabled={isOptionsDisabled}
            onOptionSelect={(selectedOption) => onOptionSelect(message, selectedOption)}
          />
        ) : null}

        {message.type === 'checkout' ? (
          <CheckoutCard message={message} isCopied={copiedMessageId === message.id} onCopyPix={onCopyPix} />
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-gray-500">
          <span>19:42</span>
          {isClient ? <CheckCheck className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> : null}
        </div>
      </div>
    </motion.div>
  );
}

type QuickReplyListProps = {
  message: ChatMessage;
  isDisabled: boolean;
  onOptionSelect: (selectedOption: string) => void;
};

function QuickReplyList({ message, isDisabled, onOptionSelect }: QuickReplyListProps) {
  const Icon = message.type === 'calendar' ? CalendarDays : ShieldCheck;

  return (
    <div className="mt-3 space-y-2">
      {message.options?.map((option) => (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00A884]/35 bg-white px-3 py-2 text-sm font-extrabold text-[#008069] shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition hover:bg-[#e7fce3] focus:outline-none focus:ring-2 focus:ring-[#00A884]/40 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-white"
          type="button"
          disabled={isDisabled}
          onClick={() => onOptionSelect(option)}
          key={option}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {option}
        </button>
      ))}
    </div>
  );
}

type CheckoutCardProps = {
  message: ChatMessage;
  isCopied: boolean;
  onCopyPix: (messageId: number | null) => void;
};

function CheckoutCard({ message, isCopied, onCopyPix }: CheckoutCardProps) {
  const handleCopyPix = () => {
    if (!message.pixKey) {
      return;
    }

    navigator.clipboard
      .writeText(message.pixKey)
      .then(() => {
        onCopyPix(message.id);
        window.setTimeout(() => onCopyPix(null), 1800);
      })
      .catch(() => {
        onCopyPix(null);
      });
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-[#f7f8fa] p-3">
      <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase text-[#008069]">
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        Pagamento seguro
      </div>

      {message.pixKey ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="line-clamp-2 break-all text-xs leading-5 text-slate-600">{message.pixKey}</p>
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A884] px-3 py-2 text-sm font-extrabold text-white transition hover:bg-[#02bd95]"
            type="button"
            onClick={handleCopyPix}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            {isCopied ? 'Chave copiada' : 'Copiar Chave Pix'}
          </button>
        </div>
      ) : null}

      {message.checkoutUrl ? (
        <a
          className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#00A884]/35 bg-white px-3 py-2 text-sm font-extrabold text-[#008069] transition hover:bg-[#e7fce3]"
          href={resolveApiUrl(message.checkoutUrl)}
          target="_blank"
          rel="noreferrer"
        >
          Abrir checkout seguro
        </a>
      ) : null}
    </div>
  );
}

type SystemEventProps = {
  text: string;
};

function SystemEvent({ text }: SystemEventProps) {
  return (
    <motion.div
      className="flex justify-center"
      initial={messageMotion.initial}
      animate={messageMotion.animate}
      exit={messageMotion.exit}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      layout
    >
      <div className="max-w-[86%] rounded-full border border-amber-200 bg-[#fff3bf]/95 px-4 py-2 text-center text-xs font-bold leading-5 text-[#54656f] shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
        {text}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      className="flex justify-start"
      initial={messageMotion.initial}
      animate={messageMotion.animate}
      exit={messageMotion.exit}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl border border-slate-200 bg-white px-4 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.10)]">
        {[0, 1, 2].map((dot) => (
          <motion.span
            className="h-2 w-2 rounded-full bg-slate-500"
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.14, ease: 'easeInOut' }}
            key={dot}
          />
        ))}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-[78%] animate-pulse rounded-2xl rounded-bl border border-slate-200 bg-white p-4">
        <div className="h-3 w-4/5 rounded-full bg-slate-300/80" />
        <div className="mt-3 h-3 w-2/3 rounded-full bg-slate-300/60" />
      </div>
      <div className="ml-auto w-[70%] animate-pulse rounded-2xl rounded-br bg-[#d9fdd3] p-4">
        <div className="h-3 w-3/4 rounded-full bg-emerald-700/20" />
      </div>
      <div className="w-[84%] animate-pulse rounded-2xl rounded-bl border border-slate-200 bg-white p-4">
        <div className="h-3 w-full rounded-full bg-slate-300/80" />
        <div className="mt-3 h-10 rounded-xl bg-slate-200/80" />
      </div>
    </motion.div>
  );
}

type ErrorBubbleProps = {
  message: string;
};

function ErrorBubble({ message }: ErrorBubbleProps) {
  return (
    <motion.div
      className="flex justify-center"
      initial={messageMotion.initial}
      animate={messageMotion.animate}
      exit={messageMotion.exit}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <div className="max-w-[90%] rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-center text-sm font-semibold leading-6 text-red-700">
        {message}
      </div>
    </motion.div>
  );
}

