import { Router } from 'express';
import { getScenarioById, getScenarioSimulation, getScenarioSummaries } from '../controllers/chatController.js';

export const scenariosRouter = Router();

scenariosRouter.get('/', getScenarioSummaries);
scenariosRouter.get('/simular', getScenarioSimulation);
scenariosRouter.get('/simular/:nichoId', getScenarioSimulation);
scenariosRouter.get('/:nichoId', getScenarioById);
