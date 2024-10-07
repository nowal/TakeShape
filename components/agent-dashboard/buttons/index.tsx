import type { FC } from 'react';
import { AgentDashboardButtonsCopy } from '@/components/agent-dashboard/buttons/copy';
import { AgentDashboardButtonsAdd } from '@/components/agent-dashboard/buttons/add';

export const AgentDashboardButtons: FC = () => {
  return (
    <div className="flex flex-row items-center justify-between h-8 text-gray-7">
      <AgentDashboardButtonsAdd />
      <AgentDashboardButtonsCopy />
    </div>
  );
};
