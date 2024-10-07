import type { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';

export const AgentDashboardButtonsCancel: FC = () => {
  const agentDashboard = useAgentDashboard();
  const {
    searchError,
    dispatchSearchError,
    onAddPainterCancel,
  } = agentDashboard;
  const cancelTitle = 'Cancel';

  const handleCancel = () => {
    if (searchError) {
      dispatchSearchError('');
    } else {
      onAddPainterCancel();
    }
  };

  return (
    <div>
      <ButtonsCvaButton
        title={cancelTitle}
        onTap={handleCancel}
        classValue="text-gray-7"
      >
        {cancelTitle}
      </ButtonsCvaButton>
    </div>
  );
};
