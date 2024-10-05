import type { FC } from 'react';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { PainterCardData } from '@/components/painter/card/data';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';

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
  return (
    <div>
      {preferredPainters.length > 0 ? (
        preferredPainters.map((painter) => {
          if (painter.userId) {
            return (
              <div
                key={painter.userId}
                className="flex items-center justify-between mb-4"
              >
                <PainterCardData
                  painterId={painter.userId}
                />
                <button
                  onClick={() =>
                    onRemovePainter(painter.phoneNumber)
                  }
                  className="ml-4 text-3xl font-bold"
                >
                  &times;
                </button>
              </div>
            );
          }
          return null;
        })
      ) : (
        <NotificationsHighlight>
          No recommended painters added yet.
        </NotificationsHighlight>
      )}
    </div>
  );
};
