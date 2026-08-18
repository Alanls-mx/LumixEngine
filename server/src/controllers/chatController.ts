import type { Request, Response } from 'express';
import {
  scenarioSimulations,
  scenarioSummaries,
  type ScenarioId,
  type ScenarioSimulation,
} from '../mocks/scenarios.js';

const fallbackScenarioId: ScenarioId = 'padrao';
const knownScenarioIds = new Set<ScenarioId>(scenarioSummaries.map((scenario) => scenario.id));

function isScenarioId(value: unknown): value is ScenarioId {
  return typeof value === 'string' && knownScenarioIds.has(value as ScenarioId);
}

export function resolveScenarioId(request: Request): ScenarioId {
  const requestedNicho = request.params.nichoId;

  return isScenarioId(requestedNicho) ? requestedNicho : fallbackScenarioId;
}

export function getScenarioSummaries(_request: Request, response: Response) {
  response.json(scenarioSummaries);
}

export function getScenarioSimulation(request: Request, response: Response<ScenarioSimulation>) {
  const nichoId = resolveScenarioId(request);

  response.json(scenarioSimulations[nichoId]);
}

export function getScenarioById(request: Request, response: Response) {
  const nichoId = resolveScenarioId(request);

  response.json(scenarioSimulations[nichoId]);
}
