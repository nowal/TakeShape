import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';

export const DashboardPricesItemRecommended: FC = () => {
  const dashboard = useDashboard();
  const { agentInfo } = dashboard;
  console.log(agentInfo)

  if (!agentInfo) return null;
  return (
    <div className="recommended flex items-center mt-2">
      <img
        src={agentInfo.profilePictureUrl}
        alt="Agent"
        className="size-8 rounded-full mr-2"
      />
      <p className="text-sm text-green-600">
        Recommended by {agentInfo.name}
      </p>
    </div>
  );
};
