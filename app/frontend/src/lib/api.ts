import { API_BASE_URL } from '@/lib/config'
import { getAuthToken } from '@/lib/authToken'
import type {
  AssignLeadPayload,
  AuthConfig,
  AuthResponse,
  CreateTeamPayload,
  CreateUserPayload,
  CreateLeadPayload,
  Lead,
  MessageSuggestion,
  MessageTemplate,
  Notification,
  SendMessagePayload,
  SendMessageResponse,
  SettingsPayload,
  SettingsResponse,
  Team,
  UpdateTeamPayload,
  UpdateUserPayload,
  UpdateLeadPayload,
  User,
} from '@/types/lead'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const hasBody = options.body !== undefined
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const details = await response.json().catch(() => null)
    throw new ApiError(response.status, details)
  }

  return response.json() as Promise<T>
}

export class ApiError extends Error {
  public readonly status: number
  public readonly details: unknown

  constructor(status: number, details: unknown) {
    super(`API request failed with status ${status}`)
    this.status = status
    this.details = details
  }
}

export const leadsApi = {
  list: () => apiRequest<Lead[]>('/leads'),

  create: (payload: CreateLeadPayload) =>
    apiRequest<Lead>('/leads', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: UpdateLeadPayload) =>
    apiRequest<Lead>(`/leads/${id}`, {
      method: 'PATCH',
      body: payload,
    }),

  assign: (id: string, payload: AssignLeadPayload) =>
    apiRequest<Lead>(`/leads/${id}/assign`, {
      method: 'PATCH',
      body: payload,
    }),
}

export const authApi = {
  config: () => apiRequest<AuthConfig>('/auth/config'),

  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  bootstrap: (payload: { nome: string; email: string; password: string }) =>
    apiRequest<AuthResponse>('/auth/bootstrap', {
      method: 'POST',
      body: payload,
    }),

  google: (credential: string) =>
    apiRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: { credential },
    }),

  me: () => apiRequest<{ user: User }>('/auth/me'),
}

export const usersApi = {
  list: () => apiRequest<User[]>('/users'),

  create: (payload: CreateUserPayload) =>
    apiRequest<User>('/users', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: UpdateUserPayload) =>
    apiRequest<User>(`/users/${id}`, {
      method: 'PATCH',
      body: payload,
    }),

  deactivate: (id: string) =>
    apiRequest<User>(`/users/${id}`, {
      method: 'DELETE',
    }),
}

export const teamsApi = {
  list: () => apiRequest<Team[]>('/teams'),

  create: (payload: CreateTeamPayload) =>
    apiRequest<Team>('/teams', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: UpdateTeamPayload) =>
    apiRequest<Team>(`/teams/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
}

export const messagesApi = {
  send: (payload: SendMessagePayload) =>
    apiRequest<SendMessageResponse>('/messages/send', {
      method: 'POST',
      body: payload,
    }),

  suggest: (payload: {
    lead_id: string
    intent?: 'boas_vindas' | 'qualificacao' | 'follow_up' | 'proposta' | 'recuperacao'
  }) =>
    apiRequest<{ suggestions: MessageSuggestion[] }>('/messages/suggest', {
      method: 'POST',
      body: payload,
    }),
}

export const messageTemplatesApi = {
  list: () => apiRequest<MessageTemplate[]>('/message-templates'),

  create: (payload: Omit<MessageTemplate, 'id' | 'data_criacao' | 'data_atualizacao'>) =>
    apiRequest<MessageTemplate>('/message-templates', {
      method: 'POST',
      body: payload,
    }),

  update: (
    id: string,
    payload: Partial<Omit<MessageTemplate, 'id' | 'data_criacao' | 'data_atualizacao'>>,
  ) =>
    apiRequest<MessageTemplate>(`/message-templates/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
}

export const notificationsApi = {
  list: () => apiRequest<Notification[]>('/notifications'),

  markRead: (id: string) =>
    apiRequest<Notification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllRead: () =>
    apiRequest<{ ok: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),
}

export const settingsApi = {
  get: () => apiRequest<SettingsResponse>('/settings'),

  update: (payload: SettingsPayload) =>
    apiRequest<SettingsResponse>('/settings', {
      method: 'PUT',
      body: payload,
    }),

  verifyEmail: () =>
    apiRequest<{ ok: boolean; message: string }>('/settings/email/verify', {
      method: 'POST',
    }),

  sendTestEmail: (to: string) =>
    apiRequest<{ ok: boolean; message: string }>('/settings/email/test', {
      method: 'POST',
      body: { to },
    }),
}
