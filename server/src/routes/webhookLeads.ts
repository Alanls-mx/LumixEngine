import { Router } from 'express';
import { forwardLeadWebhook } from '../controllers/webhookLeadController.js';

export const webhookLeadsRouter = Router();

webhookLeadsRouter.post('/lead', forwardLeadWebhook);
webhookLeadsRouter.all('/lead', (_request, response) => {
  response.setHeader('Allow', 'POST');
  response.status(405).json({ ok: false, message: 'Método não permitido.' });
});

