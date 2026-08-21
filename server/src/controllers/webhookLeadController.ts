import type { Request, Response } from 'express';
import { forwardLeadToLumixApp, type AppLeadWebhookPayload } from '../services/lumixAppWebhook.js';

type LeadWebhookBody = {
  nome?: unknown;
  email?: unknown;
  telefone?: unknown;
  valor_estimado?: unknown;
  conteudo?: unknown;
  origem?: unknown;
  form_id?: unknown;
  pagina_url?: unknown;
  pagina_path?: unknown;
  pagina_titulo?: unknown;
  referrer?: unknown;
  user_agent?: unknown;
  idioma?: unknown;
  timezone?: unknown;
  viewport?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_term?: unknown;
  utm_content?: unknown;
  gclid?: unknown;
  fbclid?: unknown;
  metadata?: unknown;
};

const allowedWebhookFields = new Set([
  'nome',
  'email',
  'telefone',
  'valor_estimado',
  'conteudo',
  'origem',
  'form_id',
  'pagina_url',
  'pagina_path',
  'pagina_titulo',
  'referrer',
  'user_agent',
  'idioma',
  'timezone',
  'viewport',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'metadata',
]);
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function sanitizeText(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(value: string) {
  const email = value.trim().toLowerCase();

  return email.length >= 6 && email.length <= 160 && emailPattern.test(email) && !email.includes('..');
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const nationalDigits = digits.startsWith('55') ? digits.slice(2) : digits;
  const areaCode = Number(nationalDigits.slice(0, 2));

  return (
    /^\+?55\d{10,11}$/.test(value.replace(/\s/g, '')) &&
    (digits.length === 12 || digits.length === 13) &&
    areaCode >= 11 &&
    areaCode <= 99 &&
    !/^(\d)\1+$/.test(nationalDigits)
  );
}

function resolveString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null;
  }

  const sanitizedValue = sanitizeText(value, maxLength);

  return sanitizedValue.length > 0 ? sanitizedValue : null;
}

function resolveMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, metadataValue]) =>
        ['string', 'number', 'boolean'].includes(typeof metadataValue) || metadataValue === null,
      )
      .map(([key, metadataValue]) => [sanitizeText(key, 80), metadataValue]),
  ) as Record<string, string | number | boolean | null>;
}

function addOptionalString(
  payload: AppLeadWebhookPayload,
  key: keyof AppLeadWebhookPayload,
  value: unknown,
  maxLength: number,
) {
  const resolvedValue = resolveString(value, maxLength);

  if (resolvedValue) {
    Object.assign(payload, {
      [key]: resolvedValue,
    });
  }
}

export async function forwardLeadWebhook(request: Request<unknown, unknown, LeadWebhookBody>, response: Response) {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return response.status(400).json({ ok: false, message: 'Dados do formulário inválidos.' });
  }

  const payloadKeys = Object.keys(request.body);

  if (payloadKeys.some((key) => !allowedWebhookFields.has(key))) {
    return response.status(400).json({ ok: false, message: 'Dados do formulário inválidos.' });
  }

  const nome = resolveString(request.body.nome, 120);
  const email = resolveString(request.body.email, 160)?.toLowerCase() ?? null;
  const telefone = resolveString(request.body.telefone, 20);
  const conteudo = resolveString(request.body.conteudo, 1400);
  const valorEstimado =
    typeof request.body.valor_estimado === 'number' && Number.isFinite(request.body.valor_estimado)
      ? request.body.valor_estimado
      : undefined;

  if (!nome || nome.length < 3) {
    return response.status(400).json({ ok: false, message: 'Informe seu nome completo.' });
  }

  if (!email || !isValidEmail(email)) {
    return response.status(400).json({ ok: false, message: 'Informe um e-mail válido.' });
  }

  if (!telefone || !isValidPhone(telefone)) {
    return response.status(400).json({ ok: false, message: 'Informe um WhatsApp real com DDD.' });
  }

  if (!conteudo || conteudo.length < 10) {
    return response.status(400).json({ ok: false, message: 'Descreva sua solicitação com um pouco mais de contexto.' });
  }

  const metadata = resolveMetadata(request.body.metadata);
  const webhookPayload: AppLeadWebhookPayload = {
    nome,
    email,
    telefone,
    ...(valorEstimado ? { valor_estimado: valorEstimado } : {}),
    conteudo,
    origem: 'SITE',
    metadata: {
      ...metadata,
      server_received_at: new Date().toISOString(),
      server_user_agent: request.get('user-agent') ?? null,
      server_ip: request.ip ?? null,
      server_origin: request.get('origin') ?? null,
      server_referer: request.get('referer') ?? null,
      forwarded_host: request.get('host') ?? null,
    },
  };

  addOptionalString(webhookPayload, 'form_id', request.body.form_id, 120);
  addOptionalString(webhookPayload, 'pagina_url', request.body.pagina_url, 500);
  addOptionalString(webhookPayload, 'pagina_path', request.body.pagina_path, 500);
  addOptionalString(webhookPayload, 'pagina_titulo', request.body.pagina_titulo, 180);
  addOptionalString(webhookPayload, 'referrer', request.body.referrer, 500);
  addOptionalString(webhookPayload, 'user_agent', request.body.user_agent, 500);
  addOptionalString(webhookPayload, 'idioma', request.body.idioma, 32);
  addOptionalString(webhookPayload, 'timezone', request.body.timezone, 80);
  addOptionalString(webhookPayload, 'viewport', request.body.viewport, 40);
  addOptionalString(webhookPayload, 'utm_source', request.body.utm_source, 220);
  addOptionalString(webhookPayload, 'utm_medium', request.body.utm_medium, 220);
  addOptionalString(webhookPayload, 'utm_campaign', request.body.utm_campaign, 220);
  addOptionalString(webhookPayload, 'utm_term', request.body.utm_term, 220);
  addOptionalString(webhookPayload, 'utm_content', request.body.utm_content, 220);
  addOptionalString(webhookPayload, 'gclid', request.body.gclid, 220);
  addOptionalString(webhookPayload, 'fbclid', request.body.fbclid, 220);

  try {
    const webhookResponse = await forwardLeadToLumixApp(webhookPayload);

    if (!webhookResponse.ok) {
      return response.status(502).json({
        ok: false,
        message: 'Não foi possível entregar sua solicitação ao LumixEngine App agora.',
      });
    }

    return response.status(200).json({
      ok: true,
      message: 'Solicitação recebida! Em breve entraremos em contato.',
    });
  } catch {
    return response.status(502).json({
      ok: false,
      message: 'O LumixEngine App não respondeu agora. Tente novamente em instantes.',
    });
  }
}
