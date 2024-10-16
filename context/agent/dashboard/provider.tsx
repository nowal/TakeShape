'use client';
import { useAgentDashboardState } from '@/context/agent/dashboard/state';
import { TProviderFc } from '@/context/type';
import { createContext, useContext } from 'react';

type TAgentDashboardContext = ReturnType<
  typeof useAgentDashboardState
>;
export const AGENT_DASHBOARD =
  createContext<TAgentDashboardContext>(
    {} as TAgentDashboardContext
  );

export const useAgentDashboard =
  (): TAgentDashboardContext => useContext(AGENT_DASHBOARD);

export const AgentDashboardProvider: TProviderFc = ({
  children,
}) => {
  const value = useAgentDashboardState();
  return (
    <AGENT_DASHBOARD.Provider value={value}>
      {children}
    </AGENT_DASHBOARD.Provider>
  );
};
