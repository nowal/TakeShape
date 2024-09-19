import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { cx } from 'class-variance-authority';
import { Fragment, type FC } from 'react';

export type TAccountMenuListItem = [
  name: string,
  handler: () => void
];
type TProps = {
  items: readonly TAccountMenuListItem[];
  classPosition?: string;
};
export const AccountMenuList: FC<TProps> = ({
  classPosition,
  items,
}) => {
  return (
    <ul
      className={cx(
        'flex flex-col items-stretch',
        classPosition ?? 'absolute right-0 top-full mt-2',
        'w-48 z-20',
        'bg-white',
        'drop-shadow-05',
        'rounded-xl'
      )}
    >
      {items.map(
        ([name, handler], index, { length: count }) => {
          const isFirst = index === 0;
          const isLast = count - 1 === index;

          return (
            <Fragment key={name}>
              {!isFirst && <LinesHorizontalLight />}
              <li>
                <button
                  onClick={handler}
                  className={cx(
                    'relative group',
                    'text-left',
                    'w-full',
                    'p-2',
                    'drop-shadow-05',
                    'text-sm',
                    isFirst && 'rounded-t-xl',
                    isLast && 'rounded-b-xl',
                    'hover:bg-white-1 hover:bg-opacity-50'
                  )}
                >
                  <div className="absolute inset-0 " />
                  {name}
                </button>
              </li>
            </Fragment>
          );
        }
      )}
    </ul>
  );
};
