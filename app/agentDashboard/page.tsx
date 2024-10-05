'use client';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { AgentDashboardButtons } from '@/components/agent-dashboard/buttons';
import { AgentDashboardAdd } from '@/components/agent-dashboard/add';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { AgentDashboardList } from '@/components/agent-dashboard/list';

const AgentDashboard = () => {
  const agentDashboard = useAgentDashboard();
  const { addingPainter } = agentDashboard;
  return (
    <div className="p-4 sm:p-8 mb-12">
      <TypographyFormTitle>
        Your Painters List
      </TypographyFormTitle>
      <AgentDashboardButtons />
      {addingPainter && <AgentDashboardAdd />}
      <AgentDashboardList />
    </div>
  );
};

export default AgentDashboard;
