import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaButtonAdd } from '@/components/cva/button/add';
import { AgentDashboardButtonsCopy } from '@/components/agent-dashboard/buttons/copy';

export const AgentDashboardButtons: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { dispatchAddingPainter } = agentDashboard;
  const addTitle = 'Add New';
  return (
    <div className="flex flex-row items-center justify-between h-8 text-gray-7">
      <div className="flex flex-row items-center gap-1.5">
        <ButtonsCvaButtonAdd
          onTap={() => dispatchAddingPainter(true)}
          title={addTitle}
        />
        {addTitle}
      </div>
      <AgentDashboardButtonsCopy />
    </div>
  );
};
