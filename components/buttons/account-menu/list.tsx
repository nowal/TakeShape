import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { cx } from 'class-variance-authority';
import { Fragment, type FC } from 'react';

type TAccountMenuListItem = [
  name: string,
  handler: () => void
];
type TProps = { items: readonly TAccountMenuListItem[] };
export const AccountMenuList: FC<TProps> = ({ items }) => {
  return (
    <ul
      className={cx(
        'flex flex-col items-stretch',
        'absolute right-0 top-full mt-2 w-48 z-20',
        'rounded-xl',
        'border border-gray-8',
        'bg-white',
        'drop-shadow-05',
        'overflow-hidden'
      )}
    >
      {items.map(([name, handler], index) => (
        <Fragment key={name}>
          {index !== 0 && <LinesHorizontalLight />}
          <li>
            <button
              onClick={handler}
              className={cx(
                'text-left',
                'w-full',
                'p-2',
                'drop-shadow-05',
                'text-sm',
                'hover:bg-white-1 hover:bg-opacity-50'
              )}
            >
              {name}
            </button>
          </li>
        </Fragment>
      ))}
    </ul>
  );
};
