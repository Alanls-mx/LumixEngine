import { API_BASE_URL } from '@/lib/config'
import type {
  AssignLeadPayload,
  CreateLeadPayload,
  Lead,
  Notification,
  SendMessagePayload,
  SendMessageResponse,
  SettingsPayload,
  SettingsResponse,
  UpdateLeadPayload,
  User,
} from '@/types/lead'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const hasBody = options.body !== undefined

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
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

export const usersApi = {
  list: () => apiRequest<User[]>('/users'),
}

export const messagesApi = {
  send: (payload: SendMessagePayload) =>
    apiRequest<SendMessageResponse>('/messages/send', {
      method: 'POST',
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
