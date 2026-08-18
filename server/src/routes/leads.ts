import { Router } from 'express';
import { captureLead } from '../controllers/leadController.js';

export const leadsRouter = Router();

leadsRouter.post('/', captureLead);
