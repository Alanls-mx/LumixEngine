import { resolveApiUrl } from '../lib/apiBaseUrl';

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
  tagline: 'Produtos digitais demonstrados em funcionamento',
  year: 2026,
};

const whatsappMessages: Record<WhatsAppLinkKey, string> = {
  budget: 'Olá! Vim pelo site e quero conversar sobre uma solução digital para minha empresa.',
  automation: 'Olá, LumixEngine! Quero entender qual solução digital faz sentido para minha operação.',
};

export const whatsappLinks: Record<WhatsAppLinkKey, string> = {
  budget: resolveApiUrl(`/api/whatsapp/budget?text=${encodeMessage(whatsappMessages.budget)}`),
  automation: resolveApiUrl(`/api/whatsapp/budget?text=${encodeMessage(whatsappMessages.automation)}`),
};

export const heroContent = {
  title: 'Antes de prometer, mostramos como funciona.',
  subtitle:
    'A própria experiência da LumixEngine demonstra nossa capacidade: simulações interativas, interfaces operacionais e cases que revelam o produto por dentro.',
  primaryCta: 'Solicitar Proposta',
  benefits: [
    { label: 'Fluxos que você pode explorar' },
    { label: 'Interfaces mostradas em contexto' },
    { label: 'Cases com profundidade de produto' },
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
  eyebrow: 'Capacidade demonstrada na prática',
  title: 'Da experiência visível à operação por trás dela',
  subtitle:
    'Não apresentamos apenas categorias de serviço. Mostramos como experiência, regras de negócio, dados e integrações formam um produto digital coerente.',
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
