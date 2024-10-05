'use client';
import { AgentDashboardButtons } from '@/components/agent-dashboard/buttons';
import { AgentDashboardAdd } from '@/components/agent-dashboard/add';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { AgentDashboardList } from '@/components/agent-dashboard/list';
import { ComponentsPanel } from '@/components/panel';

const AgentDashboard = () => {
  const agentDashboard = useAgentDashboard();
  const { addingPainter } = agentDashboard;
  return (
    <div className="flex justify-center">
      <ComponentsPanel title="Your Painters List">
        <div className="h-5.5" />
        <AgentDashboardButtons />
        <div className="h-8" />
        {addingPainter && <AgentDashboardAdd />}
        <AgentDashboardList />
      </ComponentsPanel>
    </div>
  );
};

export default AgentDashboard;
