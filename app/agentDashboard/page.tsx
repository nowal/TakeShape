'use client';
import { AgentDashboardButtons } from '@/components/agent-dashboard/buttons';
import { AgentDashboardAdd } from '@/components/agent-dashboard/add';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { AgentDashboardList } from '@/components/agent-dashboard/list/list';
import { ComponentsPanel } from '@/components/panel';
import { ComponentsCongratsContent } from '@/components/congrats/content';
import { AgentDashboardButtonsBack } from '@/components/agent-dashboard/buttons/back';

const AgentDashboard = () => {
  const agentDashboard = useAgentDashboard();
  const {
    isAddingPainter,
    inviteSuccess,
    newPainterName,
  } = agentDashboard;

  return (
    <div className="flex justify-center">
      {inviteSuccess ? (
        <ComponentsPanel classValue="text-center">
          <ComponentsCongratsContent
            emoji="🤙"
            title={
              "Congratulations! We've successfully sent an invite to:"
            }
            long="Thank you for helping us grow our community of local painters. We’ll notify you once they accept the invite and become available for instant quotes!"
            footer={
              <AgentDashboardButtonsBack classValue="text-pink font-semibold" center icon={{}}>
                Continue
              </AgentDashboardButtonsBack>
            }
          >
            <div className="text-center text-pink font-semibold text-2xl">
              {inviteSuccess.name}
            </div>
          </ComponentsCongratsContent>
        </ComponentsPanel>
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

export default AgentDashboard;
