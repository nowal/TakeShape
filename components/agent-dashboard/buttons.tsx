import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaButtonAdd } from '@/components/cva/button/add';
import { ButtonsCvaButton } from '@/components/cva/button';

export const AgentDashboardButtons: FC = () => {
  const agentDashboard = useAgentDashboard();
  const {
    inviteLink,
    dispatchAddingPainter,
    onGenerateInviteLink,
  } = agentDashboard;
  const inviteTitle = 'Invite Link';
  const addTitle = 'Add New';
  return (
    <div className="flex flex-row items-center justify-between h-8">
      <div className="flex flex-row items-center gap-2">
        <ButtonsCvaButtonAdd
          onTap={() => dispatchAddingPainter(true)}
          title={addTitle}
        />
        {addTitle}
      </div>
      {/* <div className="flex justify-center mb-4">
      
         <button
            onClick={() => dispatchAddingPainter(true)}
            className="button-green"
          >
            Add new +
          </button>
      </div> */}
      <div>
        <div className="flex justify-center">
          <ButtonsCvaButton
            title={inviteTitle}
            onTap={onGenerateInviteLink}
          >
            {inviteTitle}
          </ButtonsCvaButton>
        </div>
        {inviteLink && (
          <div className="text-center mb-4">
            <p>Invite Link:</p>
            <p className="text-blue-600">{inviteLink}</p>
          </div>
        )}
      </div>
    </div>
  );
};
