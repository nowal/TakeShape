import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { ButtonsCvaInput } from '@/components/cva/input';
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaButton } from '@/components/cva/button';
import { NotificationsHighlight } from '@/components/notifications/highlight';

export const AgentDashboardAdd: FC = () => {
  const agentDashboard = useAgentDashboard();
  const {
    searchError,
    newPainterName,
    newPainterPhone,
    dispatchNewPainterName,
    dispatchNewPainterPhone,
    onAddPainter,
    onInvitePainter,
  } = agentDashboard;

  const submitTitle = 'Submit';
  const inviteTitle = 'Send Invite';
  return (
    <div>
      <div>
        <InputsText
          value={newPainterPhone}
          onChange={(event) =>
            dispatchNewPainterPhone(event.target.value)
          }
          placeholder="Painter's Phone Number"
        />
        <ButtonsCvaButton
          title={submitTitle}
          onTap={onAddPainter}
        >
          {submitTitle}
        </ButtonsCvaButton>
      </div>
      {searchError && (
        <div>
          <NotificationsHighlight>
            {searchError}
          </NotificationsHighlight>
          <InputsText
            value={newPainterName}
            onChange={(event) =>
              dispatchNewPainterName(event.target.value)
            }
            placeholder="Painter Name"
          />
          <ButtonsCvaButton
            title={inviteTitle}
            onTap={onInvitePainter}
          >
            {submitTitle}
          </ButtonsCvaButton>
        </div>
      )}
    </div>
  );
};
