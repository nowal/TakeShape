import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaButtonAdd } from '@/components/cva/button/add';
import { NOOP } from '@/constants/functions';
import { title } from 'process';
import { AgentDashboardButtonsBack } from '@/components/agent-dashboard/buttons/back';

export const AgentDashboardButtonsAdd: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { onAddPainterStart, isAddingPainter } =
    agentDashboard;
  const addTitle = 'Add New';

  const isDisabled = isAddingPainter;

  if (isDisabled) {
    return <AgentDashboardButtonsBack />;
  }
  return (
    <ButtonsCvaButtonAdd
      onTap={isDisabled ? NOOP : onAddPainterStart}
      title={addTitle}
      isDisabled={isDisabled}
    >
      {addTitle}
    </ButtonsCvaButtonAdd>
  );
};
