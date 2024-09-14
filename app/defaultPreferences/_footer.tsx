import { ButtonsCvaButton } from '@/components/cva/button';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

type TProps = {
  isLoading: boolean;
  onPreferenceSubmit(path: string, flag: boolean): void;
};
export const DefaultPreferencesFooter: FC<TProps> = ({
  isLoading,
  onPreferenceSubmit,
}) => {
  const router = useRouter();

  const submitTitle = isLoading
    ? 'Submitting...'
    : 'Submit Preferences';
  const resubmitTitle = 'Resubmit Video';
  return (
    <footer className='flex flex-row items-center justify-between w-full'>
      <div className="flex flex-row items-end gap-4 my-4">
        <div>preferences go here...</div>
        <ButtonsCvaButton
          title={resubmitTitle}
          onTap={() => router.push('/quote')}
          className="resubmit-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
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
        disabled={isLoading}
        title={submitTitle}
      >
        {submitTitle}
      </ButtonsCvaButton>
    </footer>
  );
};
