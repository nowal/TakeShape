import { TAccordianItem } from '@/components/accordian/types';
import { IconsChevronsDown } from '@/components/icons/chevrons/down';
import { IconsChevronsUp } from '@/components/icons/chevrons/up';
import { TButtonProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TButtonProps &
  TAccordianItem & {
    isExpanded: boolean;
    paddingClassText: string;
  };
export const ComponentsAccordianItemExpandable: FC<
  TProps
> = ({
  isExpanded,
  paddingClassText,
  text,
  children,
  ...props
}) => {
  return (
    <>
      <button {...props}>
        {children}
        <div>
          {isExpanded ? (
            <IconsChevronsUp />
          ) : (
            <IconsChevronsDown />
          )}
        </div>
      </button>
      <div
        className={cx(
          'typography-landing-text',
          paddingClassText,
          isExpanded ? 'flex' : 'hidden'
        )}
      >
        {text}
      </div>
    </>
  );
};
