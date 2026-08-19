import type { Request, Response } from 'express';

type LeadWebhookBody = {
  nome?: unknown;
  email?: unknown;
  telefone?: unknown;
  valor_estimado?: unknown;
  conteudo?: unknown;
  origem?: unknown;
};

const fallbackWebhookUrl = 'https://afoot-pang-oblong.ngrok-free.dev/api/webhooks/lead';
const allowedWebhookFields = new Set(['nome', 'email', 'telefone', 'valor_estimado', 'conteudo', 'origem']);
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function getWebhookUrl() {
  return process.env.LEAD_WEBHOOK_URL ?? fallbackWebhookUrl;
}

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

  const webhookPayload = {
    nome,
    email,
    telefone,
    ...(valorEstimado ? { valor_estimado: valorEstimado } : {}),
    conteudo,
    origem: 'SITE',
  };

  try {
    const webhookResponse = await fetch(getWebhookUrl(), {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

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

