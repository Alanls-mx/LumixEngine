export const cinemaCasePath = '/portfolio/plataforma-para-cinemas';

export const portfolioHighlights = [
  {
    title: 'Jornada digital de compra',
    description: 'Programação, poltronas, extras e pagamento em um fluxo contínuo.',
    image: '/assets/portfolio/cinemas/mapa-poltronas.webp',
    href: `${cinemaCasePath}#jornada`,
    size: 'wide',
  },
  {
    title: 'Bilheteria e operação presencial',
    description: 'Venda rápida, meios de pagamento e impressão no balcão.',
    image: '/assets/portfolio/cinemas/bilheteria.webp',
    href: `${cinemaCasePath}#operacao`,
    size: 'tall',
  },
  {
    title: 'Bomboniere integrada',
    description: 'Produtos no checkout e confirmação de preparo no atendimento.',
    image: '/assets/portfolio/cinemas/checkout-bomboniere.webp',
    href: `${cinemaCasePath}#bomboniere`,
    size: 'standard',
  },
  {
    title: 'Acesso e validação',
    description: 'Ingresso digital com confirmação do operador na entrada da sala.',
    image: '/assets/portfolio/cinemas/validacao-ingresso.webp',
    href: `${cinemaCasePath}#acesso`,
    size: 'wide',
  },
  {
    title: 'Clube e relacionamento',
    description: 'Planos, créditos, benefícios e comunicação recorrente.',
    image: '/assets/portfolio/cinemas/clube.webp',
    href: `${cinemaCasePath}#relacionamento`,
    size: 'standard',
  },
] as const;

export const cinemaCaseGallery = [
  {
    id: 'catalogo',
    title: 'Filmes apresentados com contexto editorial',
    description: 'Destaques, selos e informações essenciais ajudam o público a descobrir o próximo filme antes de escolher a sessão.',
    image: '/assets/portfolio/cinemas/catalogo-cliente.webp',
    aspect: 'landscape',
  },
  {
    id: 'gestao-catalogo',
    title: 'Catálogo administrável pela equipe',
    description: 'O painel reúne publicação, status, sessões e edição dos dados do filme em um fluxo consistente.',
    image: '/assets/portfolio/cinemas/catalogo-admin.webp',
    aspect: 'landscape',
  },
  {
    id: 'jornada',
    title: 'Escolha de poltronas com disponibilidade real',
    description: 'O mapa respeita o desenho da sala, identifica lugares acessíveis e acompanha reservas temporárias.',
    image: '/assets/portfolio/cinemas/mapa-poltronas.webp',
    aspect: 'landscape',
  },
  {
    id: 'bomboniere',
    title: 'Bomboniere dentro da mesma compra',
    description: 'O cliente adiciona produtos e combos antes do pagamento, sem abandonar a jornada do ingresso.',
    image: '/assets/portfolio/cinemas/checkout-bomboniere.webp',
    aspect: 'landscape',
  },
  {
    id: 'operacao',
    title: 'Venda presencial conectada ao estoque',
    description: 'O operador seleciona sessão, poltrona, extras e forma de pagamento em uma única interface.',
    image: '/assets/portfolio/cinemas/bilheteria.webp',
    aspect: 'landscape',
  },
  {
    id: 'acesso',
    title: 'Liberação de entrada pelo operador',
    description: 'A leitura do QR Code apresenta os dados corretos e exige confirmação antes de validar o ingresso.',
    image: '/assets/portfolio/cinemas/validacao-ingresso.webp',
    aspect: 'landscape',
  },
  {
    id: 'entrega',
    title: 'Preparo e entrega da bomboniere',
    description: 'Cada item pode ser conferido antes da entrega, reduzindo erros em horários de pico.',
    image: '/assets/portfolio/cinemas/entrega-bomboniere.webp',
    aspect: 'landscape',
  },
  {
    id: 'carteira',
    title: 'Ingresso na carteira digital',
    description: 'Filme, sessão, assento e QR Code ficam acessíveis no celular do cliente.',
    image: '/assets/portfolio/cinemas/google-wallet.webp',
    aspect: 'portrait',
  },
  {
    id: 'relacionamento',
    title: 'Clube pensado para recorrência',
    description: 'Planos, créditos e benefícios fazem parte da mesma conta e da mesma operação financeira.',
    image: '/assets/portfolio/cinemas/clube.webp',
    aspect: 'wide',
  },
  {
    id: 'comunicacao',
    title: 'Comunicação com identidade do cinema',
    description: 'Modelos de e-mail permitem divulgar programação, estreias, clube, cupons e bomboniere.',
    image: '/assets/portfolio/cinemas/email-marketing.webp',
    aspect: 'portrait',
  },
] as const;
