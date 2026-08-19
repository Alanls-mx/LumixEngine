import { resolveApiUrl } from '../lib/apiBaseUrl';

export type LeadWebhookPayload = {
  nome: string;
  email: string;
  telefone: string;
  valor_estimado?: number;
  conteudo: string;
  origem: 'SITE';
};

type LeadWebhookResponse = {
  ok?: boolean;
  message?: string;
};

export async function submitLeadWebhook(payload: LeadWebhookPayload, signal?: AbortSignal) {
  const response = await fetch(resolveApiUrl('/api/webhooks/lead'), {
    method: 'POST',
    cache: 'no-store',
    credentials: 'omit',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as LeadWebhookResponse | null;
    throw new Error(errorPayload?.message ?? 'Não foi possível enviar sua solicitação agora.');
  }

  return response.json().catch(() => ({ ok: true })) as Promise<LeadWebhookResponse>;
}

export function getLeadWebhookErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return 'Não foi possível conectar ao LumixEngine App agora. Tente novamente ou converse direto pelo WhatsApp.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível enviar sua solicitação agora. Tente novamente em instantes.';
}
