import type { FC } from 'react';
import { PainterCardData } from '@/components/painter/card/data';
import { cx } from 'class-variance-authority';
import { TPainter } from '@/context/agent/dashboard/types';
import { IconsCloseAlt } from '@/components/icons/close/alt';
import { useAgentDashboardRemove } from '@/components/agent-dashboard/list/remove';
import { CvaButton } from '@/components/cva/button';
import { IconsLoading } from '@/components/icons/loading';

type TProps = TPainter;
export const AgentDashboardItem: FC<TProps> = (painter) => {
  const agentDashboardRemove = useAgentDashboardRemove();
  const { onRemovePainter, removingUser } =
    agentDashboardRemove;
  const isRemoving = removingUser === painter.phoneNumber;
  return (
    <div
      key={painter.userId}
      className={cx(
        'flex justify-between',
        'bg-white-2',
        'rounded-lg',
        'p-2.5'
      )}
    >
      <PainterCardData painterId={painter.userId} />
      <CvaButton
        title="Remove painter"
        onTap={() =>
          !isRemoving &&
          onRemovePainter(painter.phoneNumber)
        }
        isIconOnly
        size="iconSm"
        isDisabled={isRemoving}
        classValue="text-pink"
        intent="icon"
         center
      >
        {isRemoving ? <IconsLoading /> : <IconsCloseAlt />}
      </CvaButton>
    </div>
  );
};
