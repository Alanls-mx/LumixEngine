import { Router } from 'express';
import { captureLead } from '../controllers/leadController.js';

export const leadsRouter = Router();

leadsRouter.post('/', captureLead);
leadsRouter.all('/', (_request, response) => {
  response.setHeader('Allow', 'POST');
  response.status(405).json({ ok: false, message: 'Método não permitido.' });
});
