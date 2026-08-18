import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ScenarioId } from '../types/scenario';

type ScenarioContextValue = {
  activeScenarioId: ScenarioId;
  setActiveScenarioId: (scenarioId: ScenarioId) => void;
};

const defaultScenarioId: ScenarioId = 'padrao';

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

type ScenarioProviderProps = {
  children: ReactNode;
};

export function ScenarioProvider({ children }: ScenarioProviderProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>(defaultScenarioId);

  const value = useMemo(
    () => ({
      activeScenarioId,
      setActiveScenarioId,
    }),
    [activeScenarioId],
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const context = useContext(ScenarioContext);

  if (!context) {
    throw new Error('useScenario must be used inside ScenarioProvider.');
  }

  return context;
}
