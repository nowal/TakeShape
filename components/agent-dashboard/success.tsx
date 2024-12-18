import { AgentDashboardButtonsBack } from '@/components/agent-dashboard/buttons/back';
import { ComponentsCongratsContent } from '@/components/congrats/content';
import { ComponentsPanel } from '@/components/panel';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { useKey } from '@/hooks/key';
import type { FC } from 'react';

export const AgentDashboardSuccess: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { inviteSuccess, onAddPainterCancel } =
    agentDashboard;
  useKey({
    handlers: {
      onKeyDown: (event) => {
        if (event.key === 'Enter') {
          onAddPainterCancel();
        }
      },
    },
  });
  
  return (
    <ComponentsPanel classValue="text-center">
      <ComponentsCongratsContent
        emoji="🤙"
        title={
          "Congratulations! We've successfully sent an invite to:"
        }
        long="Thank you for helping us grow our community of local painters. We’ll notify you once they accept the invite and become available for quotes!"
        footer={
          <AgentDashboardButtonsBack
            classValue="text-pink font-semibold"
            center
            icon={{}}
          >
            Continue
          </AgentDashboardButtonsBack>
        }
      >
        {inviteSuccess && (
          <div className="text-center text-pink font-semibold text-2xl">
            {inviteSuccess.name}
          </div>
        )}
      </ComponentsCongratsContent>
    </ComponentsPanel>
  );
};
