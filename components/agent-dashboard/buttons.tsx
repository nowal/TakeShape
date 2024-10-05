import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';

export const AgentDashboardButtons: FC = () => {
  const agentDashboard = useAgentDashboard();
  const {
    inviteLink,
    dispatchAddingPainter,
    onGenerateInviteLink,
  } = agentDashboard;
  return (
    <div>
      <div className="flex flex-row justify-between">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => dispatchAddingPainter(true)}
            className="button-green"
          >
            Add new +
          </button>
        </div>
        <div>
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={onGenerateInviteLink}
              className="button-green"
            >
              Get Invite Link
            </button>
          </div>
          {inviteLink && (
            <div className="text-center mb-4">
              <p>Invite Link:</p>
              <p className="text-blue-600">{inviteLink}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
