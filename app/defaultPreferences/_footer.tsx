import { useRouter } from 'next/router';
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

  return (
    <footer>
      <div className="preferences-buttons flex justify-center gap-4 my-4">
        <button
          onClick={() => router.push('/quote')}
          className="resubmit-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
        >
          Resubmit Video
        </button>
        <button
          onClick={() =>
            onPreferenceSubmit('/dashboard', false)
          }
          className={`only-preferences-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading
            ? 'Submitting...'
            : 'Submit Preferences'}
        </button>
      </div>
    </footer>
  );
};
