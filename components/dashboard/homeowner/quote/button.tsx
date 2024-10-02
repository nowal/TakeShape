import { useRouter } from 'next/navigation';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsQuote } from '@/components/icons/quote';
import { useDashboard } from '@/context/dashboard/provider';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export const DashboardHomeownerQuoteButton: FC = () => {
  const router = useRouter();
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
      <ButtonsCvaButton
        title={preferencesTitle}
        onTap={() =>
          router.push(
            `/defaultPreferences?userImageId=${selectedUserImage}`
          )
        }
        size="fill"
        center
      >
        <div
          className={cx(
            'flex flex-row',
            'items-center',
            'gap-2'
          )}
        >
          <IconsQuote />
          <span className="font-semibold text-sm">
            {preferencesTitle}
          </span>
        </div>
      </ButtonsCvaButton>
    </div>
  );
};
