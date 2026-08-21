export type AppLeadWebhookPayload = {
  nome: string;
  email?: string;
  telefone?: string;
  valor_estimado?: number;
  conteudo?: string;
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
  metadata?: Record<string, string | number | boolean | null>;
};

const localWebhookUrl = 'http://127.0.0.1:3333/api/webhooks/lead';
const productionWebhookUrl = 'https://app.lumixengine.com/api/webhooks/lead';

function getWebhookUrl() {
  return (
    process.env.LUMIX_APP_WEBHOOK_URL ??
    process.env.LEAD_WEBHOOK_URL ??
    (process.env.NODE_ENV === 'production' ? productionWebhookUrl : localWebhookUrl)
  );
}

export async function forwardLeadToLumixApp(payload: AppLeadWebhookPayload) {
  const webhookResponse = await fetch(getWebhookUrl(), {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: webhookResponse.ok,
    status: webhookResponse.status,
  };
}
