export const LEAD_STATUSES = [
  'NOVO_LEAD',
  'NEGOCIACAO',
  'PROPOSTA',
  'GANHO',
  'PERDIDO',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export type MessageOrigem = 'SITE' | 'WHATSAPP'
export type MessageDirecao = 'INBOUND' | 'OUTBOUND'
export type MessageStatusEnvio = 'ENVIADO' | 'ENTREGUE' | 'LIDO' | 'ERRO'
export type TaskStatus = 'PENDENTE' | 'CONCLUIDA'
export type UserRole = 'ADMIN' | 'ATENDENTE'
export type NotificationTipo =
  | 'NEW_LEAD'
  | 'NEW_MESSAGE'
  | 'LEAD_ASSIGNED'
  | 'SEND_ERROR'
  | 'SYSTEM'

export type User = {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
  avatar_url: string | null
  google_id: string | null
  team_id: string | null
  team?: Team | null
  ultimo_login: string | null
  data_criacao?: string
}

export type Team = {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  data_criacao: string
  data_atualizacao: string
  users?: User[]
}

export type Lead = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  status: LeadStatus
  valor_estimado: string | null
  data_criacao: string
  assigned_to_id: string | null
  last_interaction_at: string
  assigned_to: User | null
  messages: Message[]
  tasks: Task[]
}

export type Message = {
  id: string
  lead_id: string
  conteudo: string
  origem: MessageOrigem
  direcao: MessageDirecao
  user_id: string | null
  client_request_id: string | null
  provider_message_id: string | null
  status_envio: MessageStatusEnvio
  data_envio: string
  user: User | null
}

export type Task = {
  id: string
  lead_id: string
  descricao: string
  status: TaskStatus
  data_limite: string | null
}

export type CreateLeadPayload = {
  nome: string
  email?: string
  telefone?: string
  status?: LeadStatus
  valor_estimado?: number
}

export type UpdateLeadPayload = Partial<
  Pick<Lead, 'nome' | 'email' | 'telefone' | 'status' | 'assigned_to_id'>
> & {
  valor_estimado?: number | null
}

export type AssignLeadPayload = {
  assigned_to_id: string | null
}

export type SendMessagePayload = {
  lead_id: string
  conteudo: string
  user_id?: string
  client_request_id?: string
  channels?: Array<'WHATSAPP' | 'EMAIL'>
}

export type DeliveryStatus = {
  ok: boolean
  skipped: boolean
  status?: number
  response?: unknown
  reason?: string
  errorType?: string
}

export type SendMessageResponse = {
  ok: boolean
  deduplicated?: boolean
  delivery: DeliveryStatus
  deliveries?: {
    whatsapp?: DeliveryStatus
    email?: DeliveryStatus
  }
  message: Message & {
    lead?: Lead
  }
}

export type AuthResponse = {
  token: string
  user: User
}

export type AuthConfig = {
  googleClientId: string | null
}

export type CreateUserPayload = {
  nome: string
  email: string
  password?: string
  role?: UserRole
  team_id?: string | null
  ativo?: boolean
}

export type UpdateUserPayload = Partial<CreateUserPayload> & {
  password?: string | null
}

export type CreateTeamPayload = {
  nome: string
  descricao?: string | null
  ativo?: boolean
}

export type UpdateTeamPayload = Partial<CreateTeamPayload>

export type MessageTemplate = {
  id: string
  titulo: string
  categoria: string
  conteudo_texto: string
  ativo: boolean
  uso_ia: boolean
  data_criacao: string
  data_atualizacao: string
}

export type MessageSuggestion = Pick<
  MessageTemplate,
  'id' | 'titulo' | 'categoria' | 'conteudo_texto'
> & {
  origem: 'AI' | 'AI_TEMPLATE' | 'TEMPLATE'
}

export type Notification = {
  id: string
  titulo: string
  conteudo: string
  tipo: NotificationTipo
  lead_id: string | null
  user_id: string | null
  lida: boolean
  data_criacao: string
  lead?: Lead | null
  user?: User | null
}

export type AppSetting = {
  id: string
  chave: string
  valor: string | null
  categoria: string
  secreto: boolean
  configured: boolean
  data_atualizacao: string
}

export type SettingsPayload = Partial<
  Record<
    | 'SMTP_HOST'
    | 'SMTP_PORT'
    | 'SMTP_USER'
    | 'SMTP_PASS'
    | 'SMTP_FROM'
    | 'INTERNAL_LEAD_NOTIFICATION_EMAIL'
    | 'WHATSAPP_API_URL'
    | 'WHATSAPP_API_TOKEN'
    | 'GOOGLE_CLIENT_ID',
    string
  >
>

export type SettingsResponse = {
  ok?: boolean
  settings: AppSetting[]
  status: {
    email: {
      configured: boolean
      host: string | null
      port: number
      from: string | null
      internalEmail: string | null
    }
    whatsapp: {
      configured: boolean
      apiUrl: string | null
      hasToken: boolean
    }
  }
}
