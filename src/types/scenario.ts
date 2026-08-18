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

export interface ScenarioResponse {
  nichoId: ScenarioId;
  businessProfile: BusinessProfile;
  flow: ChatMessage[];
}

export interface ScenarioSummary {
  id: ScenarioId;
  label: string;
  icon: string;
}
