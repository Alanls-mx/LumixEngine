import { Router } from 'express';

const defaultPhone = '5512981157296';

const fallbackMessages = {
  budget: 'Olá! Vim pelo site e gostaria de fazer um orçamento.',
  diagnostic: 'Olá! Vim pelo site e gostaria de receber um diagnóstico de atendimento gratuito.',
} as const;

function getWhatsAppPhone() {
  return (process.env.WHATSAPP_PHONE ?? defaultPhone).replace(/\D/g, '');
}

function normalizeMessage(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveMessage(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const message = normalizeMessage(value);

  return message.length > 0 ? message.slice(0, 500) : fallback;
}

function buildWhatsAppUrl(message: string) {
  const phone = getWhatsAppPhone();

  if (!/^55\d{10,11}$/.test(phone)) {
    throw new Error('Invalid WHATSAPP_PHONE configuration.');
  }

  const url = new URL(`https://wa.me/${phone}`);
  url.searchParams.set('text', message);

  return url.toString();
}

export const whatsappRouter = Router();

whatsappRouter.get('/budget', (request, response) => {
  response.redirect(302, buildWhatsAppUrl(resolveMessage(request.query.text, fallbackMessages.budget)));
});

whatsappRouter.get('/diagnostic', (request, response) => {
  response.redirect(302, buildWhatsAppUrl(resolveMessage(request.query.text, fallbackMessages.diagnostic)));
});

whatsappRouter.all('*', (_request, response) => {
  response.setHeader('Allow', 'GET');
  response.status(405).json({ ok: false, message: 'Método não permitido.' });
});
