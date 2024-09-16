import type { FC } from 'react';

export const DefaultPreferencesOptionsPopup: FC = () => {
  return (
    <div className="popup-message bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
      <strong className="font-bold">Warning: </strong>
      <span className="block sm:inline">
        If you modify your paint preferences, then any
        existing quotes will no longer be available.
      </span>
    </div>
  );
};
