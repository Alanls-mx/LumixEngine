import { resolveApiUrl } from '../lib/apiBaseUrl';

type LeadMetadataValue = string | number | boolean | null;

export type LeadWebhookPayload = {
  nome: string;
  email: string;
  telefone: string;
  valor_estimado?: number;
  conteudo: string;
  origem: 'SITE';
  form_id?: string;
  pagina_url?: string;
  pagina_path?: string;
  pagina_titulo?: string;
  referrer?: string;
  user_agent?: string;
  idioma?: string;
  timezone?: string;
  viewport?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  metadata?: Record<string, LeadMetadataValue>;
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

function readQueryParam(url: URL, key: string) {
  const value = url.searchParams.get(key);

  return value && value.trim().length > 0 ? value.trim().slice(0, 220) : undefined;
}

export function getSiteLeadContext(
  formId: string,
  metadata: Record<string, LeadMetadataValue> = {},
): Pick<
  LeadWebhookPayload,
  | 'form_id'
  | 'pagina_url'
  | 'pagina_path'
  | 'pagina_titulo'
  | 'referrer'
  | 'user_agent'
  | 'idioma'
  | 'timezone'
  | 'viewport'
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'utm_term'
  | 'utm_content'
  | 'gclid'
  | 'fbclid'
  | 'metadata'
> {
  if (typeof window === 'undefined') {
    return {
      form_id: formId,
      metadata,
    };
  }

  const currentUrl = new URL(window.location.href);
  const viewport = `${window.innerWidth}x${window.innerHeight}`;

  return {
    form_id: formId,
    pagina_url: currentUrl.href.slice(0, 500),
    pagina_path: `${currentUrl.pathname}${currentUrl.search}`.slice(0, 500),
    pagina_titulo: document.title.slice(0, 180),
    referrer: document.referrer.slice(0, 500) || undefined,
    user_agent: navigator.userAgent.slice(0, 500),
    idioma: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport,
    utm_source: readQueryParam(currentUrl, 'utm_source'),
    utm_medium: readQueryParam(currentUrl, 'utm_medium'),
    utm_campaign: readQueryParam(currentUrl, 'utm_campaign'),
    utm_term: readQueryParam(currentUrl, 'utm_term'),
    utm_content: readQueryParam(currentUrl, 'utm_content'),
    gclid: readQueryParam(currentUrl, 'gclid'),
    fbclid: readQueryParam(currentUrl, 'fbclid'),
    metadata: {
      captured_at: new Date().toISOString(),
      color_scheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      ...metadata,
    },
  };
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
