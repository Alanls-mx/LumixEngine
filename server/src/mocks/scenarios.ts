export type ScenarioId =
  | 'clinica'
  | 'restaurante'
  | 'marmoraria'
  | 'imobiliaria'
  | 'barbearia'
  | 'ecommerce'
  | 'padrao';

export type ChatSender = 'client' | 'bot';
export type ChatMessageType = 'text' | 'options' | 'calendar' | 'checkout' | 'system_event';
export type ChatStatus = 'typing';

export interface BusinessProfile {
  name: string;
  status: string;
  avatarUrl: string;
}

export interface ChatMessage {
  id: number;
  sender: ChatSender;
  type: ChatMessageType;
  text: string;
  delay: number;
  status?: ChatStatus;
  options?: string[];
  pixKey?: string;
  checkoutUrl?: string;
}

export interface ScenarioSimulation {
  nichoId: ScenarioId;
  businessProfile: BusinessProfile;
  flow: ChatMessage[];
}

export interface ScenarioSummary {
  id: ScenarioId;
  label: string;
  icon: string;
}

export const scenarioSummaries = [
  { id: 'clinica', label: 'Clínica / Saúde', icon: 'stethoscope' },
  { id: 'marmoraria', label: 'Marmoraria / Construção', icon: 'gem' },
  { id: 'barbearia', label: 'Barbearia / Estética', icon: 'scissors' },
  { id: 'ecommerce', label: 'E-commerce / Varejo', icon: 'shopping-bag' },
  { id: 'restaurante', label: 'Restaurantes', icon: 'utensils' },
  { id: 'imobiliaria', label: 'Imobiliárias', icon: 'building2' },
  { id: 'padrao', label: 'Padrão', icon: 'sparkles' },
] satisfies ScenarioSummary[];

export const scenarioSimulations = {
  clinica: {
    nichoId: 'clinica',
    businessProfile: {
      name: 'Clínica Lumix Saúde',
      status: 'Online agora',
      avatarUrl:
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=82',
    },
    flow: [
      {
        id: 1,
        sender: 'client',
        type: 'text',
        text: 'Olá, gostaria de agendar uma limpeza para quinta-feira.',
        delay: 800,
      },
      {
        id: 2,
        sender: 'bot',
        type: 'text',
        text: 'Olá! Me chamo Dra. Ana (Assistente Virtual). Temos disponibilidade às 10h ou às 15h30. Qual prefere?',
        delay: 1500,
        status: 'typing',
      },
      { id: 3, sender: 'client', type: 'text', text: 'Preferência 10h.', delay: 1000 },
      {
        id: 4,
        sender: 'bot',
        type: 'text',
        text: 'Perfeito! Horário reservado. Para confirmar a consulta, envie a foto da sua carteirinha do convênio ou escolha pagamento via Pix.',
        delay: 1800,
        status: 'typing',
      },
      {
        id: 5,
        sender: 'bot',
        type: 'system_event',
        text: 'Consulta Confirmada e Integrada ao Prontuário!',
        delay: 1800,
      },
      {
        id: 6,
        sender: 'bot',
        type: 'options',
        text: 'O que deseja testar agora na rotina da clínica?',
        options: ['Ver Demonstração', 'Simular Agenda', 'Falar com Consultor'],
        delay: 1200,
        status: 'typing',
      },
    ],
  },
  restaurante: {
    nichoId: 'restaurante',
    businessProfile: {
      name: 'Bella Pizza',
      status: 'Online agora',
      avatarUrl: '/assets/avatars/restaurante.jpg',
    },
    flow: [
      { id: 1, sender: 'client', type: 'text', text: 'Boa noite, qual o cardápio de hoje?', delay: 800 },
      {
        id: 2,
        sender: 'bot',
        type: 'text',
        text: 'Boa noite! Nosso destaque hoje é o Combo Família por R$ 89,90. Deseja realizar o pedido agora?',
        delay: 1400,
        status: 'typing',
      },
      { id: 3, sender: 'client', type: 'text', text: 'Sim, quero esse combo!', delay: 900 },
      {
        id: 4,
        sender: 'bot',
        type: 'text',
        text: 'Ótimo! Informe seu endereço de entrega e a forma de pagamento.',
        delay: 1500,
        status: 'typing',
      },
      {
        id: 5,
        sender: 'bot',
        type: 'system_event',
        text: 'Pedido enviado para a Cozinha em 2 segundos!',
        delay: 1800,
      },
      {
        id: 6,
        sender: 'bot',
        type: 'options',
        text: 'Quer continuar testando o fluxo do restaurante?',
        options: ['Ver Demonstração', 'Simular Agenda', 'Falar com Consultor'],
        delay: 1200,
        status: 'typing',
      },
    ],
  },
  marmoraria: {
    nichoId: 'marmoraria',
    businessProfile: {
      name: 'Lumix Design & Pedras',
      status: 'Online agora',
      avatarUrl:
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=320&q=82',
    },
    flow: [
      { id: 1, sender: 'client', type: 'text', text: 'Preciso de um orçamento para bancada de cozinha em Quartzito.', delay: 800 },
      {
        id: 2,
        sender: 'bot',
        type: 'text',
        text: 'Olá! Qual a medida aproximada da bancada (comprimento x largura)?',
        delay: 1500,
        status: 'typing',
      },
      { id: 3, sender: 'client', type: 'text', text: '2,5m x 0,60m com cuba esculpida.', delay: 900 },
      {
        id: 4,
        sender: 'bot',
        type: 'text',
        text: 'Estimativa inicial: R$ 3.200,00. Deseja agendar a visita técnica para medição fina?',
        delay: 1300,
        status: 'typing',
      },
      {
        id: 5,
        sender: 'bot',
        type: 'system_event',
        text: 'Orçamento Automático Gerado!',
        delay: 1800,
      },
      {
        id: 6,
        sender: 'bot',
        type: 'options',
        text: 'Quer continuar testando o fluxo da marmoraria?',
        options: ['Ver Demonstração', 'Simular Agenda', 'Falar com Consultor'],
        delay: 1200,
        status: 'typing',
      },
    ],
  },
  barbearia: {
    nichoId: 'barbearia',
    businessProfile: {
      name: 'Lumix Barber & Spa',
      status: 'Online agora',
      avatarUrl:
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=320&q=82',
    },
    flow: [
      { id: 1, sender: 'client', type: 'text', text: 'Boa tarde, tem horário para corte e barba hoje?', delay: 800 },
      {
        id: 2,
        sender: 'bot',
        type: 'calendar',
        text: 'Boa tarde! Temos encaixes com os profissionais disponíveis. Qual horário prefere?',
        options: ['Hoje às 17:30', 'Hoje às 19:00', 'Amanhã às 10:00'],
        delay: 1500,
        status: 'typing',
      },
      { id: 3, sender: 'client', type: 'text', text: 'Hoje às 19:00', delay: 900 },
      {
        id: 4,
        sender: 'bot',
        type: 'checkout',
        text: 'Perfeito. Para segurar o horário, gerei uma taxa de reserva via Pix de R$ 20,00.',
        pixKey:
          '00020126360014BR.GOV.BCB.PIX0114lumixbarber520400005303986540520.005802BR5914LUMIX BARBER6009SAO PAULO62140510TESTE-PIX6304A1B2',
        delay: 1500,
        status: 'typing',
      },
      {
        id: 5,
        sender: 'bot',
        type: 'system_event',
        text: 'Horário confirmado e profissional notificado.',
        delay: 1800,
      },
      {
        id: 6,
        sender: 'bot',
        type: 'options',
        text: 'Quer continuar testando o fluxo da barbearia?',
        options: ['Ver Demonstração', 'Simular Agenda', 'Falar com Consultor'],
        delay: 1200,
        status: 'typing',
      },
    ],
  },
  ecommerce: {
    nichoId: 'ecommerce',
    businessProfile: {
      name: 'Lumix Store',
      status: 'Online agora',
      avatarUrl:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=320&q=82',
    },
    flow: [
      { id: 1, sender: 'client', type: 'text', text: 'Olá, vi um produto no site e queria comprar pelo WhatsApp.', delay: 800 },
      {
        id: 2,
        sender: 'bot',
        type: 'options',
        text: 'Claro. Posso recuperar seu carrinho e finalizar o pedido por aqui. Qual produto deseja ver?',
        options: ['Kit Sofá Retrátil', 'Mesa Madeira Nobre', 'Ver catálogo completo'],
        delay: 1500,
        status: 'typing',
      },
      { id: 3, sender: 'client', type: 'text', text: 'Kit Sofá Retrátil', delay: 900 },
      {
        id: 4,
        sender: 'bot',
        type: 'checkout',
        text: 'Produto localizado. Valor de R$ 2.490,00 com frete grátis. Gerei o checkout seguro para finalizar agora.',
        checkoutUrl: '/api/whatsapp/budget?text=Quero%20finalizar%20o%20pedido%20do%20Kit%20Sof%C3%A1%20Retr%C3%A1til',
        delay: 1500,
        status: 'typing',
      },
      {
        id: 5,
        sender: 'bot',
        type: 'system_event',
        text: 'Carrinho recuperado e pedido enviado ao CRM.',
        delay: 1800,
      },
      {
        id: 6,
        sender: 'bot',
        type: 'options',
        text: 'Quer continuar testando o fluxo da loja?',
        options: ['Ver Demonstração', 'Simular Agenda', 'Falar com Consultor'],
        delay: 1200,
        status: 'typing',
      },
    ],
  },
  imobiliaria: {
    nichoId: 'imobiliaria',
    businessProfile: {
      name: 'Prime Lar Imóveis',
      status: 'Online agora',
      avatarUrl: '/assets/avatars/imobiliaria.jpg',
    },
    flow: [
      { id: 1, sender: 'client', type: 'text', text: 'Vi o anúncio do apartamento de 2 quartos no centro. Qual o valor?', delay: 850 },
      {
        id: 2,
        sender: 'bot',
        type: 'text',
        text: 'Olá! O valor é R$ 450.000, com entrada facilitada. Deseja agendar uma visita presencial ou receber o tour virtual em vídeo?',
        delay: 1500,
        status: 'typing',
      },
      { id: 3, sender: 'client', type: 'text', text: 'Quero receber o tour virtual.', delay: 900 },
      {
        id: 4,
        sender: 'bot',
        type: 'text',
        text: 'Enviando o vídeo em alta definição! Um corretor especialista também foi notificado para te atender.',
        delay: 1300,
        status: 'typing',
      },
      {
        id: 5,
        sender: 'bot',
        type: 'system_event',
        text: 'Lead Quente enviado ao CRM da Imobiliária!',
        delay: 1800,
      },
      {
        id: 6,
        sender: 'bot',
        type: 'options',
        text: 'Quer continuar testando o fluxo da imobiliária?',
        options: ['Ver Demonstração', 'Simular Agenda', 'Falar com Consultor'],
        delay: 1200,
        status: 'typing',
      },
    ],
  },
  padrao: {
    nichoId: 'padrao',
    businessProfile: {
      name: 'LumixEngine',
      status: 'Online agora',
      avatarUrl: '/assets/avatars/padrao.jpg',
    },
    flow: [
      { id: 1, sender: 'client', type: 'text', text: 'Olá! Quero entender como vocês podem ajudar meu negócio.', delay: 800 },
      {
        id: 2,
        sender: 'bot',
        type: 'text',
        text: 'Oi! A LumixEngine entende a rotina do negócio e constrói a solução digital adequada: site, loja, sistema interno, automação ou integração.',
        delay: 1400,
        status: 'typing',
      },
      {
        id: 3,
        sender: 'client',
        type: 'text',
        text: 'Hoje meu site, minhas planilhas e meus contatos ficam separados. Minha equipe perde tempo copiando informação e conferindo tudo manualmente.',
        delay: 1300,
      },
      {
        id: 4,
        sender: 'bot',
        type: 'text',
        text: 'Esse é um gargalo comum: a solicitação chega, mas não vira processo claro. A solução conecta a entrada do cliente ao próximo passo da equipe.',
        delay: 1800,
        status: 'typing',
      },
      {
        id: 5,
        sender: 'client',
        type: 'text',
        text: 'Não quero contratar algo pronto que não encaixe na minha rotina. Preciso de algo desenhado para o meu jeito de operar.',
        delay: 1200,
      },
      {
        id: 6,
        sender: 'bot',
        type: 'text',
        text: 'Perfeito. Primeiro mapeamos o processo. Depois definimos se o melhor caminho é página, loja, painel interno, CRM, agenda, automação ou integração com ferramentas existentes.',
        delay: 1800,
        status: 'typing',
      },
      {
        id: 7,
        sender: 'bot',
        type: 'options',
        text: 'Qual parte da operação você quer ver organizada primeiro?',
        options: [
          'Entrada de clientes',
          'Leads sem retorno',
          'Agenda desorganizada',
          'Pedidos e orçamentos',
          'Equipe sobrecarregada',
          'Pagamentos e confirmação',
        ],
        delay: 1500,
        status: 'typing',
      },
    ],
  },
} satisfies Record<ScenarioId, ScenarioSimulation>;

