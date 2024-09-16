import type { FC } from 'react';

type TProps = { title: string; subtitle: string };
export const DefaultPreferencesOptionsInitialText: FC<TProps> = ({ title, subtitle }) => {
  return (
    <div className='flex flex-col'>
      <span className="text-black-7 text-sm">{title}</span>
      <span className="text-gray-5 text-sm">{subtitle}</span>
    </div>
  );
};
