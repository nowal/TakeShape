import type { FC } from 'react';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { AgentDashboardItem } from '@/components/agent-dashboard/list/item';

export const AgentDashboardList: FC = () => {
  const agentDashboard = useAgentDashboard();
  const {
    isLoading,
    error,
    preferredPainters,
    onRemovePainter,
  } = agentDashboard;
  if (isLoading) return <FallbacksLoadingCircle />;
  if (error)
    return (
      <NotificationsHighlight>
        {error}
      </NotificationsHighlight>
    );
  if (!preferredPainters) return null;
  const isEmpty = preferredPainters.length === 0;
  if (isEmpty)
    return (
      <NotificationsHighlight>
        No recommended painters added yet.
      </NotificationsHighlight>
    );
  return (
    <div>
      {preferredPainters.map((painter) => {
        if (painter.userId) {
          return (
            <AgentDashboardItem
              key={painter.userId}
              {...painter}
            />
          );
        }
        return null;
      })}
    </div>
  );
};
