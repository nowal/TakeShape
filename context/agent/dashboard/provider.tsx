'use client';
import { useAgentDashboardState } from '@/context/agent/dashboard/state';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';
import { toast } from 'react-toastify';

type TAgentDashboardContext = ReturnType<
  typeof useAgentDashboardState
>;
export const AGENT_DASHBOARD =
  createContext<TAgentDashboardContext>(
    {} as TAgentDashboardContext
  );

export const useAgentDashboard = (): TAgentDashboardContext =>
  useContext(AGENT_DASHBOARD);

export const AgentDashboardProvider: FC<
  PropsWithChildren
> = ({ children }) => {
  const value = useAgentDashboardState();
  return (
    <AGENT_DASHBOARD.Provider value={value}>
      {children}
    </AGENT_DASHBOARD.Provider>
  );
};
