import type { FC } from 'react';

type TProps = {
  head: string;
  tail: string;
};
export const DashboardModalQuoteAcceptNameRow: FC<
  TProps
> = ({ head, tail }) => {
  return (
    <div className="flex flex-row justify-between gap-2">
      <span className="text-gray-9 text-xs font-semibold">
        {head}
      </span>
      <span className="text-gray-7 text-xs font-semibold">
        {tail}
      </span>
    </div>
  );
};
