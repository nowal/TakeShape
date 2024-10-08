import { FC } from 'react';
import { IconsLoading } from '@/components/icons/loading';
import { usePainterData } from '@/hooks/painter/data';
import { PainterCard } from '@/components/painter/card';

type TProps = {
  painterId: string;
};
export const PainterCardData: FC<TProps> = ({
  painterId,
}) => {
  const painterData = usePainterData(painterId);

  if (!painterData) {
    return (
      <div className="flex flex-row gap-2 text-xs">
        <IconsLoading classValue="text-white" />
      </div>
    );
  }

  return <PainterCard {...painterData} />;
};
