import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';
import { InputsText } from '@/components/inputs/text';
import { CvaButton } from '@/components/cva/button';
import { NotificationsInlineInfo } from '@/components/notifications/inline/info';
import { AgentDashboardButtonsCancel } from '@/components/agent-dashboard/buttons/cancel';
import { TypographyButtonPrimary } from '@/components/typography/button/primary';
import { NOOP } from '@/constants/functions';
import { IconsLoading } from '@/components/icons/loading';

export const AgentDashboardAdd: FC = () => {
  const agentDashboard = useAgentDashboard();
  const {
    error,
    searchError,
    newPainterName,
    inputPhoneRef,
    inputNameRef,
    newPainterPhone,
    loadingRecord,
    dispatchNewPainterName,
    dispatchNewPainterPhone,
    onAddPainter,
    onInvitePainter,
  } = agentDashboard;

  const addTitle = 'Add';
  const isAddLoading = Boolean(loadingRecord.add);
  const isAddDisabled =
    !Boolean(newPainterPhone) || isAddLoading;
  const inviteTitle = 'Send Invite';
  const isInviteLoading = Boolean(loadingRecord.invite);
  const isInviteDisabled =
    !Boolean(newPainterName) || isInviteLoading;
  const isPainterNotFound = Boolean(searchError);
  return (
    <div>
      <div>
        <InputsText
          ref={inputPhoneRef}
          value={newPainterPhone}
          onChange={(event) =>
            isPainterNotFound
              ? NOOP
              : dispatchNewPainterPhone(event.target.value)
          }
          placeholder="Painter's Phone Number"
          disabled={isPainterNotFound}
          onKeyDown={({ key }) => {
            if (key === 'Enter' && !isAddDisabled) {
              onAddPainter();
            }
          }}
        />
        <div className="h-3.5" />
      </div>
      <div>
        {isPainterNotFound ? (
          <div>
            <NotificationsInlineInfo>
              {searchError}
            </NotificationsInlineInfo>
            <div className="h-7" />
            <InputsText
              ref={inputNameRef}
              value={newPainterName}
              onChange={(event) =>
                dispatchNewPainterName(event.target.value)
              }
              placeholder="Painter Name"
              onKeyDown={({ key }) => {
                if (key === 'Enter' && !isInviteDisabled) {
                  onInvitePainter();
                }
              }}
            />
            <div className="h-3.5" />
            <div className="flex flex-row justify-between">
              <AgentDashboardButtonsCancel />
              <CvaButton
                title={inviteTitle}
                onTap={
                  isInviteDisabled ? NOOP : onInvitePainter
                }
                isDisabled={isInviteDisabled}
                icon={
                  isInviteLoading
                    ? { Leading: IconsLoading }
                    : {}
                }
                classValue="gap-2.5"
              >
                <TypographyButtonPrimary>
                  {inviteTitle}
                </TypographyButtonPrimary>
              </CvaButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-between">
            <AgentDashboardButtonsCancel />
            <CvaButton
              title={addTitle}
              onTap={isAddDisabled ? NOOP : onAddPainter}
              isDisabled={isAddDisabled}
              icon={
                isAddLoading
                  ? { Leading: IconsLoading }
                  : {}
              }
              classValue="gap-2.5"
            >
              <TypographyButtonPrimary>
                {addTitle}
              </TypographyButtonPrimary>
            </CvaButton>
          </div>
        )}
        {error && (
          <div className="text-sm flex flex-col items-center">
            <div className="h-3.5" />
            <TypographyButtonPrimary>
              {error}
            </TypographyButtonPrimary>
          </div>
        )}
      </div>
    </div>
  );
};
