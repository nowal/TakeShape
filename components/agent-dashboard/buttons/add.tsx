import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaButtonAdd } from '@/components/cva/button/add';

export const AgentDashboardButtonsAdd: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { dispatchAddingPainter } = agentDashboard;
  const addTitle = 'Add New';
  return (
      <div className="flex flex-row items-center gap-1.5">
        <ButtonsCvaButtonAdd
          onTap={() => dispatchAddingPainter(true)}
          title={addTitle}
        />
        {addTitle}
      </div>
  );
};
