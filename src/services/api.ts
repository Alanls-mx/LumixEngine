import type { ScenarioId, ScenarioResponse, ScenarioSummary } from '../types/scenario';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

type LeadCaptureRequest = {
  email: string;
  phone: string;
  source: string;
};

type LeadCaptureResponse = {
  ok: true;
  message: string;
  leadId: string;
};

async function requestJson<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, init);

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? `API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function getScenarios(signal?: AbortSignal): Promise<ScenarioSummary[]> {
  return requestJson<ScenarioSummary[]>('/api/scenarios', { signal });
}

export function getScenarioSimulation(nichoId: ScenarioId, signal?: AbortSignal): Promise<ScenarioResponse> {
  return requestJson<ScenarioResponse>(`/api/scenarios/simular/${nichoId}`, { signal });
}

export function captureLead(payload: LeadCaptureRequest): Promise<LeadCaptureResponse> {
  return requestJson<LeadCaptureResponse>('/api/leads', {
    method: 'POST',
    cache: 'no-store',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
