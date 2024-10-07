import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsCopy } from '@/components/icons/copy';
import { useTimebomb } from '@/hooks/time-bomb';
import { IconsTick14 } from '@/components/icons/tick/14';
import { NOOP } from '@/constants/functions';

export const AgentDashboardButtonsCopy: FC = () => {
  const agentDashboard = useAgentDashboard();
  const { onGenerateInviteLink } = agentDashboard;

  const { isArmed, trigger } = useTimebomb(1000);
  const inviteTitle = isArmed ? 'Copied' : 'Invite Link';

  const handleTap = async () => {
    try {
      await onGenerateInviteLink();
      trigger();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ButtonsCvaButton
      title={inviteTitle}
      onTap={isArmed ? NOOP : handleTap}
      isDisabled={isArmed}
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
