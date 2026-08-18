import { Router } from 'express';

const defaultPhone = '5512981157296';

const fallbackMessages = {
  budget: 'Olá! Vim pelo site e gostaria de fazer um orçamento.',
  diagnostic: 'Olá! Vim pelo site e gostaria de receber um diagnóstico de atendimento gratuito.',
} as const;

function getWhatsAppPhone() {
  return (process.env.WHATSAPP_PHONE ?? defaultPhone).replace(/\D/g, '');
}

function resolveMessage(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const message = value.trim();

  return message.length > 0 ? message.slice(0, 800) : fallback;
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${getWhatsAppPhone()}?text=${encodeURIComponent(message)}`;
}

export const whatsappRouter = Router();

whatsappRouter.get('/budget', (request, response) => {
  response.redirect(302, buildWhatsAppUrl(resolveMessage(request.query.text, fallbackMessages.budget)));
});

whatsappRouter.get('/diagnostic', (request, response) => {
  response.redirect(302, buildWhatsAppUrl(resolveMessage(request.query.text, fallbackMessages.diagnostic)));
});
