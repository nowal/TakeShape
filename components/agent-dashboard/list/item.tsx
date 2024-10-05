import type { FC } from 'react';
import { PainterCardData } from '@/components/painter/card/data';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { cx } from 'class-variance-authority';
import { TPainter } from '@/context/agent/dashboard/types';

type TProps = TPainter;
export const AgentDashboardItem: FC<TProps> = (painter) => {
  const agentDashboard = useAgentDashboard();
  const { onRemovePainter } = agentDashboard;
  return (
    <div
      key={painter.userId}
      className={cx(
        'flex items-center justify-between',
        'bg-white-2'
      )}
    >
      <PainterCardData painterId={painter.userId} />
      <button
        onClick={() => onRemovePainter(painter.phoneNumber)}
        className="ml-4 text-3xl font-bold"
      >
        &times;
      </button>
    </div>
  );
};
