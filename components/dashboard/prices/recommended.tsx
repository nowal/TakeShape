import {
  isMocks,
  MOCKS_AGENT_INFO,
} from '@/components/dashboard/client/quotes/mocks';
import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';
import Image from "next/image"

export const DashboardPricesItemRecommended: FC = () => {
  const dashboard = useDashboard();
  const agentInfo = isMocks()
    ? MOCKS_AGENT_INFO
    : dashboard.agentInfo;

  if (!agentInfo) return null;

  return (
    <div className="recommended flex flex-row items-center bg-white-green rounded gap-2 px-1.5 py-1">
      <div className="flex flex-col items-end">
        <p className="text-green text-xs">Recommended by</p>
        <div className="text-green-1 text-xs">
          {agentInfo.name}
        </div>
      </div>
      <Image
        src={agentInfo.profilePictureUrl}
        alt="Agent"
        className="size-6 rounded-full"
      />
    </div>
  );
};
