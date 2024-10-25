import type { FC } from 'react';
import { CvaButtonAdd } from '@/components/cva/button/add';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { IconsChevronsLeft } from '@/components/icons/chevrons/left';
import {
  CvaButton,
  TCvaButtonProps,
} from '@/components/cva/button';
import { cx } from 'class-variance-authority';

type TProps = Partial<TCvaButtonProps>;
export const AgentDashboardButtonsBack: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  const agentDashboard = useAgentDashboard();
  const { onAddPainterCancel } = agentDashboard;
  const backTitle = 'Back';

  return (
    <CvaButton
      onTap={onAddPainterCancel}
      title={backTitle}
      icon={{ Leading: IconsChevronsLeft }}
      classValue={cx( classValue)}
      {...props}
    >
      {children ?? backTitle}
    </CvaButton>
  );
};
