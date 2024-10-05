import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsCopy } from '@/components/icons/copy';
import { useTimebomb } from '@/hooks/time-bomb';
import { IconsTick14 } from '@/components/icons/tick/14';

export const AgentDashboardButtonsCopy: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { onGenerateInviteLink } = agentDashboard;

  const { isArmed, trigger } = useTimebomb();
  const inviteTitle = isArmed ? 'Copied' : 'Invite Link';

  const handleTap = () => {
    trigger();
    onGenerateInviteLink();
  };

  return (
    <ButtonsCvaButton
      title={inviteTitle}
      onTap={handleTap}
      icon={
        isArmed
          ? { Trailing: IconsTick14 }
          : { Trailing: IconsCopy }
      }
      classValue="gap-1.5"
    >
      {inviteTitle}
    </ButtonsCvaButton>
  );
};
