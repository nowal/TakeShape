import { IconsQuote } from '@/components/icons/quote';
import { useDashboard } from '@/context/dashboard/provider';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import { CvaLink } from '@/components/cva/link';
import { usePreferences } from '@/context/preferences/provider';
import { IconsLoading } from '@/components/icons/loading';

export const DashboardHomeownerQuoteButton: FC = () => {
  const preferences = usePreferences();
  const { isFetchingPreferences } = preferences;
  const dashboard = useDashboard();
  const { selectedUserImage } = dashboard;

  const preferencesTitle = `Your Quote's Preferences`;

  return (
    <div
      className={cx(
        'relative',
        'rounded-xl bg-white w-full'
      )}
      style={{
        height: 68,
        boxShadow:
          '0px 4.288px 28.623px 0px rgba(0, 0, 0, 0.09)',
      }}
    >
      <CvaLink
        title={preferencesTitle}
        href={`/defaultPreferences?userImageId=${selectedUserImage}`}
        size="fill"
        center
        isDisabled={isFetchingPreferences}
      >
        <div
          className={cx(
            'flex flex-row',
            'items-center',
            'gap-2'
          )}
        >
          {isFetchingPreferences ? (
            <IconsLoading />
          ) : (
            <IconsQuote />
          )}
          <span className="font-semibold text-sm">
            {preferencesTitle}
          </span>
        </div>
      </CvaLink>
    </div>
  );
};
