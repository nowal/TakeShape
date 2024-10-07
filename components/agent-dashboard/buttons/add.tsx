import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaButtonAdd } from '@/components/cva/button/add';
import { NOOP } from '@/constants/functions';
import { IconsChevronsLeft } from '@/components/icons/chevrons/left';

export const AgentDashboardButtonsAdd: FC = () => {
  const agentDashboard = useAgentDashboard();
  const {
    onAddPainterStart,
    onAddPainterCancel,
    isAddingPainter,
  } = agentDashboard;
  const addTitle = 'Add New';
  const backTitle = 'Back';

  const isDisabled =
    isAddingPainter

  if (isDisabled) {
    return (
      <ButtonsCvaButtonAdd
        onTap={onAddPainterCancel}
        title={backTitle}
        icon={{Leading:IconsChevronsLeft}}
      >
        {backTitle}
      </ButtonsCvaButtonAdd>
    );
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
