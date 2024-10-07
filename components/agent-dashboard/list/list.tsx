import type { FC } from 'react';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { AgentDashboardItem } from '@/components/agent-dashboard/list/item';
import { NotificationsInlineInfo } from '@/components/notifications/inline/info';
import { FallbacksLoadingCircleCenter } from '@/components/fallbacks/loading/circle/center';

export const AgentDashboardList: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { isLoading, error, preferredPainters } =
    agentDashboard;

  if (isLoading) return <FallbacksLoadingCircleCenter classValue='p-2.5' />;
  if (error)
    return (
      <NotificationsInlineInfo>
        {error}
      </NotificationsInlineInfo>
    );
  if (!preferredPainters) return null;
  const isEmpty = preferredPainters.length === 0;
  if (isEmpty)
    return (
      <NotificationsInlineInfo>
        No recommended painters added yet.
      </NotificationsInlineInfo>
    );
  return (
    <div className='flex flex-col items-stretch gap-2'>
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
