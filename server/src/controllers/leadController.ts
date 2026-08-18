import type { Request, Response } from 'express';
import { saveLead } from '../services/leadStore.js';

type LeadCaptureBody = {
  email?: unknown;
  phone?: unknown;
  source?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneAllowedPattern = /^[\d\s()+.-]+$/;

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function isPlausibleEmail(value: string) {
  const normalizedEmail = value.toLowerCase();

  return (
    normalizedEmail.length <= 160 &&
    emailPattern.test(normalizedEmail) &&
    !normalizedEmail.includes('..')
  );
}

function isPlausiblePhone(value: string) {
  const digits = normalizePhone(value);
  const hasAllowedCharacters = phoneAllowedPattern.test(value);
  const hasValidLength = digits.length >= 10 && digits.length <= 11;
  const isRepeatedDigit = /^(\d)\1+$/.test(digits);

  return hasAllowedCharacters && hasValidLength && !isRepeatedDigit;
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

  const source = typeof request.body.source === 'string' ? request.body.source.slice(0, 80) : 'lead_capture';

  const lead = await saveLead({
    email,
    phone,
    source,
    userAgent: request.get('user-agent') ?? null,
    ip: request.ip,
  });

  return response.status(200).json({
    ok: true,
    message: 'Solicitação recebida! Em breve entraremos em contato.',
    leadId: lead.id,
  });
}
