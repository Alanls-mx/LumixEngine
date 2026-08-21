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
  senha_hash?: string
  role: UserRole
  data_criacao?: string
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
}

export type SendMessageResponse = {
  ok: boolean
  delivery: {
    ok: boolean
    skipped: boolean
    status?: number
    response?: unknown
    reason?: string
  }
  message: Message & {
    lead?: Lead
  }
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
    | 'WHATSAPP_API_TOKEN',
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
