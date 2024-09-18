import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonsCvaButton } from '@/components/cva/button';

export const DashboardFooter: FC = () => {
  const router = useRouter();
  const resubmitTitle = 'Resubmit Video';
  // const resetTitle = 'Reset Preferences';

  return (
    <div className="button-group my-4 flex justify-center gap-4">
      <ButtonsCvaButton
        title={resubmitTitle}
        onTap={() => router.push('/quote')}
        size="sm"
        intent="primary"
      >
        {resubmitTitle}
      </ButtonsCvaButton>
      {/* <ButtonsCvaButton
        title={resetTitle}
        onTap={() =>
          router.push(
            `/defaultPreferences?userImageId=${selectedUserImage}`
          )
        }
        size="sm"
        intent="primary"
      >
        {resetTitle}
      </ButtonsCvaButton> */}
    </div>
  );
};
