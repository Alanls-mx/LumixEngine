export type WhatsAppLinkKey = 'budget' | 'automation';

export type CompanyConfig = {
  name: string;
  tagline: string;
  year: number;
};

export type HeroBenefit = {
  label: string;
};

export type MockChatMetric = {
  value: string;
  label: string;
};

export type ServiceCard = {
  title: string;
  description: string;
  bullets: readonly string[];
  icon: 'site' | 'automation' | 'crm';
  featured?: boolean;
  badge?: string;
};

const encodeMessage = (message: string): string => encodeURIComponent(message);

export const company: CompanyConfig = {
  name: 'LumixEngine',
  tagline: 'Soluções digitais sob medida para negócios locais',
  year: 2026,
};

const whatsappMessages: Record<WhatsAppLinkKey, string> = {
  budget: 'Olá! Vim pelo site e quero conversar sobre uma solução digital para minha empresa.',
  automation: 'Olá, LumixEngine! Quero entender qual solução digital faz sentido para minha operação.',
};

export const whatsappLinks: Record<WhatsAppLinkKey, string> = {
  budget: `/api/whatsapp/budget?text=${encodeMessage(whatsappMessages.budget)}`,
  automation: `/api/whatsapp/budget?text=${encodeMessage(whatsappMessages.automation)}`,
};

export const heroContent = {
  title: 'Tecnologia construída em torno do seu negócio.',
  subtitle:
    'Sites, lojas virtuais, sistemas, automações e integrações desenvolvidos de acordo com o que sua operação realmente precisa.',
  primaryCta: 'Solicitar Proposta',
  benefits: [
    { label: 'Solução sob medida' },
    { label: 'Sites, sistemas e dados integrados' },
    { label: 'Estrutura pronta para evoluir' },
  ] satisfies readonly HeroBenefit[],
};

export const mockChatContent = {
  title: 'Fluxo digital conectado',
  subtitle: 'Site, sistema e atendimento no mesmo processo',
  status: 'Projeto em análise',
  customerMessage: 'Preciso organizar meu site, pedidos e atendimento. Vocês fazem sob medida?',
  botMessage:
    'Fazemos sim. Primeiro entendemos o processo, depois indicamos se faz sentido site, loja, sistema, automação ou integração.',
  leadTitle: 'Necessidade mapeada',
  leadDescription: 'Interesse: solução digital sob medida',
  metrics: [
    { value: 'Site', label: 'captação e presença digital' },
    { value: 'Sistema', label: 'processo e dados integrados' },
  ] satisfies readonly MockChatMetric[],
};

export const servicesContent = {
  eyebrow: 'Construção digital para a rotina',
  title: 'Soluções digitais para o que sua operação precisa',
  subtitle:
    'Do site que capta clientes ao sistema interno que organiza dados, construímos a peça certa para reduzir retrabalho e dar mais controle à equipe.',
  items: [
    {
      title: 'Sites, landing pages e lojas virtuais',
      description:
        'Páginas e lojas pensadas para apresentar o negócio, captar clientes, vender produtos e conectar pedidos aos canais certos.',
      bullets: ['Institucional, captação e SEO', 'Catálogo, checkout e Pix quando necessário'],
      icon: 'site',
    },
    {
      title: 'Sistemas web sob medida',
      description:
        'Dashboards, portais internos, CRMs e painéis desenvolvidos para a rotina da sua equipe, sem depender de planilhas paralelas.',
      bullets: ['Gestão de clientes, tarefas e equipes', 'Indicadores e histórico em uma tela'],
      icon: 'automation',
      featured: true,
      badge: 'Projeto sob medida',
    },
    {
      title: 'Automações e integrações',
      description:
        'Conectamos WhatsApp, agenda, planilhas, APIs, pagamentos Pix, ERPs e outras ferramentas para os dados circularem sem retrabalho.',
      bullets: ['WhatsApp como uma das entradas do fluxo', 'Integrações com planilhas, APIs e sistemas'],
      icon: 'crm',
    },
  ] satisfies readonly ServiceCard[],
};
