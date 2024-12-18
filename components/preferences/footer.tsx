import { CvaButton } from '@/components/cva/button';
import { CvaLink } from '@/components/cva/link';
import { IconsLoading16White } from '@/components/icons/loading/16/white';
import { IconsRedo } from '@/components/icons/redo';
import { usePreferences } from '@/context/preferences/provider';
import { useQuote } from '@/context/quote/provider';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export const PreferencesFooter: FC = () => {
  const quote = useQuote();
  const { onResubmit } = quote;
  const preferences = usePreferences();
  const { onPreferenceSubmit, isSubmitting } = preferences;

  const submitTitle = isSubmitting
    ? 'Submitting...'
    : 'Submit Preferences';

  const resubmitTitle = 'Resubmit Video';

  return (
    <footer
      className={cx(
        'flex flex-col items-center justify-between w-full gap-4 sm:flex-row sm:gap-0'
      )}
    >
      {/*<div
        onClick={onResubmit}
        className="flex flex-col items-end gap-4 xs:flex-row"
      >
        <CvaLink
          icon={{ Leading: IconsRedo }}
          title={resubmitTitle}
          classValue="py-4"
          href="/quote"
          gap="lg"
        >
          {resubmitTitle}
        </CvaLink>
      </div>*/}
      <CvaButton
        onTap={() =>
          onPreferenceSubmit('/dashboard', false)
        }
        intent="primary"
        size="sm"
        isDisabled={isSubmitting}
        icon={{
          Leading: isSubmitting
            ? IconsLoading16White
            : null,
        }}
        title={submitTitle}
        gap="xl"
      >
        {submitTitle}
      </CvaButton>
    </footer>
  );
};
