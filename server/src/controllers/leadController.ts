import type { Request, Response } from 'express';
import { forwardLeadToLumixApp } from '../services/lumixAppWebhook.js';
import { saveLead } from '../services/leadStore.js';

type LeadCaptureBody = {
  email?: unknown;
  phone?: unknown;
  source?: unknown;
  companyWebsite?: unknown;
};

const allowedLeadFields = new Set(['email', 'phone', 'source', 'companyWebsite']);
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const phoneAllowedPattern = /^[\d\s()+.-]{10,24}$/;
const sourcePattern = /^[\w\s./:-]{1,80}$/;

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

function isPlausibleEmail(value: string) {
  const normalizedEmail = value.toLowerCase();

  return (
    normalizedEmail.length <= 160 &&
    normalizedEmail.length >= 6 &&
    emailPattern.test(normalizedEmail) &&
    !normalizedEmail.includes('..') &&
    !normalizedEmail.startsWith('.') &&
    !normalizedEmail.endsWith('.')
  );
}

function isPlausiblePhone(value: string) {
  const digits = normalizePhone(value);
  const nationalDigits = digits.startsWith('55') ? digits.slice(2) : digits;
  const areaCode = Number(nationalDigits.slice(0, 2));
  const hasAllowedCharacters = phoneAllowedPattern.test(value);
  const hasValidLength = digits.length === 12 || digits.length === 13;
  const hasBrazilCountryCode = digits.startsWith('55');
  const hasValidAreaCode = areaCode >= 11 && areaCode <= 99;
  const isRepeatedDigit = /^(\d)\1+$/.test(nationalDigits);

  return hasAllowedCharacters && hasValidLength && hasBrazilCountryCode && hasValidAreaCode && !isRepeatedDigit;
}

function resolveEmail(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (isPlausibleEmail(trimmedValue)) {
    return trimmedValue.toLowerCase();
  }

  return null;
}

function resolvePhone(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (isPlausiblePhone(trimmedValue)) {
    return normalizePhone(trimmedValue);
  }

  return null;
}

export async function captureLead(request: Request<unknown, unknown, LeadCaptureBody>, response: Response) {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return response.status(400).json({
      ok: false,
      message: 'Dados do formulário inválidos.',
    });
  }

  const payloadKeys = Object.keys(request.body);

  if (payloadKeys.some((key) => !allowedLeadFields.has(key))) {
    return response.status(400).json({
      ok: false,
      message: 'Dados do formulário inválidos.',
    });
  }

  if (typeof request.body.companyWebsite === 'string' && request.body.companyWebsite.trim().length > 0) {
    return response.status(200).json({
      ok: true,
      message: 'Solicitação recebida! Em breve entraremos em contato.',
      leadId: 'queued',
    });
  }

  const email = resolveEmail(request.body.email);
  const phone = resolvePhone(request.body.phone);

  if (!email || !phone) {
    return response.status(400).json({
      ok: false,
      message: 'Informe um e-mail válido e um telefone/WhatsApp real com DDD.',
      errors: {
        email: email ? null : 'Informe um e-mail válido.',
        phone: phone ? null : 'Informe um telefone/WhatsApp com DDD.',
      },
    });
  }

  const source =
    typeof request.body.source === 'string' && sourcePattern.test(request.body.source.trim())
      ? request.body.source.trim()
      : 'lead_capture';

  const lead = await saveLead({
    email,
    phone,
    source,
    userAgent: request.get('user-agent') ?? null,
    ip: request.ip,
  });

  void forwardLeadToLumixApp({
    nome: 'Lead capturado no site',
    email,
    telefone: `+${phone}`,
    conteudo: `[Captura legada] Lead enviado pelo endpoint /api/leads. Origem: ${source}.`,
    origem: 'SITE',
    form_id: source,
    metadata: {
      server_received_at: new Date().toISOString(),
      server_user_agent: request.get('user-agent') ?? null,
      server_ip: request.ip ?? null,
      server_origin: request.get('origin') ?? null,
      server_referer: request.get('referer') ?? null,
      forwarded_host: request.get('host') ?? null,
      legacy_lead_id: lead.id,
    },
  }).catch(() => {
    // O armazenamento local continua servindo como fallback caso o App esteja indisponível.
  });

  return response.status(200).json({
    ok: true,
    message: 'Solicitação recebida! Em breve entraremos em contato.',
    leadId: lead.id,
  });
}
