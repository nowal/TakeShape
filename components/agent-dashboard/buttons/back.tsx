import type { FC } from 'react';
import { ButtonsCvaButtonAdd } from '@/components/cva/button/add';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { IconsChevronsLeft } from '@/components/icons/chevrons/left';
import {
  ButtonsCvaButton,
  TButtonsCvaButtonProps,
} from '@/components/cva/button';

type TProps = Partial<TButtonsCvaButtonProps>;
export const AgentDashboardButtonsBack: FC<TProps> = ({
  children,
  ...props
}) => {
  const agentDashboard = useAgentDashboard();
  const { onAddPainterCancel } = agentDashboard;
  const backTitle = 'Back';

  return (
    <ButtonsCvaButton
      onTap={onAddPainterCancel}
      title={backTitle}
      icon={{ Leading: IconsChevronsLeft }}
      {...props}
    >
      {children ?? backTitle}
    </ButtonsCvaButton>
  );
};
