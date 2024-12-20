'use client';
import { useAgentRegisterState } from '@/context/agent/register/state';
import { TProviderFc } from '@/context/type';
import { createContext, useContext } from 'react';

type TAgentRegisterContext = ReturnType<
  typeof useAgentRegisterState
>;
export const AGENT_REGISTER =
  createContext<TAgentRegisterContext>(
    {} as TAgentRegisterContext
  );

export const useAgentRegister = (): TAgentRegisterContext =>
  useContext(AGENT_REGISTER);

export const AgentRegisterProvider: TProviderFc = ({
  children,
}) => {
  const value = useAgentRegisterState();
  return (
    <AGENT_REGISTER.Provider value={value}>
      {children}
    </AGENT_REGISTER.Provider>
  );
};
