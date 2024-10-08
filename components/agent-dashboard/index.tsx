import type { FC } from 'react';
import { ComponentsPanel } from '@/components/panel';
import { ComponentsCongratsContent } from '@/components/congrats/content';
import { AgentDashboardButtonsBack } from '@/components/agent-dashboard/buttons/back';
import { AgentDashboardAdd } from '@/components/agent-dashboard/add';
import { AgentDashboardButtons } from '@/components/agent-dashboard/buttons';
import { AgentDashboardList } from '@/components/agent-dashboard/list/list';
import { AgentDashboardSuccess } from '@/components/agent-dashboard/success';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';

export const ComponentsAgentDashboard: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { isAddingPainter, inviteSuccess } = agentDashboard;

  return (
    <div className="flex justify-center">
      {inviteSuccess ? (
        <AgentDashboardSuccess />
      ) : (
        <ComponentsPanel title="Your Painters List">
          <div className="h-5.5" />
          <AgentDashboardButtons />
          <div className="h-8" />
          {isAddingPainter ? (
            <AgentDashboardAdd />
          ) : (
            <AgentDashboardList />
          )}
        </ComponentsPanel>
      )}
    </div>
  );
};
