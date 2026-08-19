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
