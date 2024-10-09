import { ButtonsCvaButton } from '@/components/cva/button';
import { ButtonsCvaLink } from '@/components/cva/link';
import { IconsRedo } from '@/components/icons/redo';
import { usePreferences } from '@/context/preferences/provider';
import { useQuote } from '@/context/quote/provider';
import type { FC } from 'react';

export const PreferencesFooter: FC = () => {
  const quote = useQuote();
  const {
   onResubmit
  } = quote;
  const preferences = usePreferences();
  const {
    isLoading,
    onPreferenceSubmit,
    isSubmitting,
  } = preferences;

  const submitTitle = isSubmitting
    ? 'Submitting...'
    : 'Submit Preferences';

  const resubmitTitle = 'Resubmit Video';

  return (
    <footer className="flex flex-col items-center justify-between w-full sm:flex-row">
      <div onClick={onResubmit} className="flex flex-col items-end gap-4 my-4 xs:flex-row">
        <ButtonsCvaLink
          icon={{ Leading: IconsRedo }}
          title={resubmitTitle}
          
          href="/quote"
          gap="lg"
        >
          {resubmitTitle}
        </ButtonsCvaLink>
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
