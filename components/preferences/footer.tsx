import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsRedo } from '@/components/icons/redo';
import { usePreferences } from '@/context/preferences/provider';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

export const PreferencesFooter: FC = () => {
  const router = useRouter();
  const preferences = usePreferences();
  const { isLoading, onPreferenceSubmit } = preferences;

  const submitTitle = isLoading
    ? 'Submitting...'
    : 'Submit Preferences';

  const resubmitTitle = 'Resubmit Video';

  return (
    <footer className="flex flex-col items-center justify-between w-full sm:flex-row">
      <div className="flex flex-col items-end gap-4 my-4 xs:flex-row">
        {/* <div>video.mp4</div> */}
        <ButtonsCvaButton
          icon={{ Leading: IconsRedo }}
          title={resubmitTitle}
          onTap={() => router.push('/quote')}
          classValue="gap-2"
        >
          {resubmitTitle}
        </ButtonsCvaButton>
      </div>
      <ButtonsCvaButton
        onTap={() =>
          onPreferenceSubmit('/dashboard', false)
        }
        className={`only-preferences-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        intent="primary"
        size="sm"
        disabled={isLoading}
        title={submitTitle}
      >
        <strong>{submitTitle}</strong>
      </ButtonsCvaButton>
    </footer>
  );
};
