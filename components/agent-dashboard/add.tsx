import type { FC } from 'react';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';

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

  return (
    <div>
      <input
        type="text"
        value={newPainterPhone}
        onChange={(event) =>
          dispatchNewPainterPhone(event.target.value)
        }
        placeholder="Painter Phone Number"
        className="p-2 border rounded w-full mb-2"
      />
      <button
        onClick={onAddPainter}
        className="button-green"
      >
        Submit
      </button>
      {searchError && (
        <div>
          <p className="">{searchError}</p>
          <input
            type="text"
            value={newPainterName}
            onChange={(event) =>
              dispatchNewPainterName(event.target.value)
            }
            placeholder="Painter Name"
            className="p-2 border rounded w-full mb-2"
          />
          <button
            onClick={onInvitePainter}
            className="button-green"
          >
            Send Invite
          </button>
        </div>
      )}
    </div>
  );
};
