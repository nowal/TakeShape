import type { FC } from 'react';
import { cx } from 'class-variance-authority';

export const DashboardHomeownerQuoteTitle: FC = () => {
  return (
    <div>
      <h4
        className={cx(
          'text-black',
          'font-semibold font-base font-open-sans',
          'w-full',
          'truncate'
        )}
      >
        {/* {userData?.title} */}
      </h4>
    </div>
  );
};
