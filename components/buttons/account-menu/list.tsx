import { CvaButton } from '@/components/cva/button';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { useAuth } from '@/context/auth/provider';
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
  const { menu } = useAuth();
  const { dispatchMenuOpen } = menu;
  return (
    <ul
      className={cx(
        'flex flex-col items-stretch',
        classPosition ?? 'absolute right-0 top-full mt-2',
        'w-full sm:w-48 z-20',
        'bg-white',
        'drop-shadow-none sm:drop-shadow-05',
        'rounded-xl'
      )}
    >
      {items.map(
        ([name, handler], index, { length: count }) => {
          const isFirst = index === 0;
          const isLast = count - 1 === index;

          return (
            <Fragment key={name}>
              <li>
                {!isFirst && <LinesHorizontalLight />}
                <CvaButton
                  onTap={() => {
                    handler();
                    dispatchMenuOpen(false);
                  }}
                  title={name}
                  classValue={cx(
                    'group',
                    'w-full',
                    'p-10 sm:p-2',
                    isFirst && 'sm:rounded-t-xl',
                    isLast && 'sm:rounded-b-xl',
                    'active:bg-black',
                    'hover:bg-pink hover:bg-opacity-100 sm:hover:bg-white-1 sm:hover:bg-opacity-50'
                  )}
                >
                  <span
                    className={cx(
                      'text-left',
                      'text-2xl sm:text-xs',
                      'font-bold sm:font-semibold',
                      'tight-01',
                      'text-gray-7',
                      'group-hover:text-white sm:group-hover:text-black'
                    )}
                  >
                    {name}
                  </span>
                </CvaButton>
              </li>
            </Fragment>
          );
        }
      )}
    </ul>
  );
};
